import { ApolloServer } from 'apollo-server';
import { GraphQLSchema, GraphQLObjectType, GraphQLInputObjectType, GraphQLString, GraphQLInt, GraphQLFloat, GraphQLList, GraphQLEnumType, GraphQLID, printSchema } from 'graphql';

import { sequelize } from './sequelize';
import { ContentType } from './models/ContentType';
import { ContentEntry } from './models/ContentEntry';
import { ContentTypeField } from './models/ContentTypeField';
import { IFindOptions, Sequelize } from 'sequelize-typescript';

export const server = async () => {

  const contentTypeBuffers = new Map();
  const contentTypeTimouts = new Map();

  const whereStringOp = new GraphQLInputObjectType({
    name: 'WhereStringOp',
    fields: {
      neq: { type: GraphQLString },
      eq: { type: GraphQLString },
    }
  });

  const whereNumberOp = new GraphQLInputObjectType({
    name: 'whereNumberOp',
    fields: {
      eq: { type: GraphQLFloat },
      gt: { type: GraphQLFloat },
      gte: { type: GraphQLFloat },
      lt: { type: GraphQLFloat },
      lte: { type: GraphQLFloat },
    }
  });

  const convert = (obj) => (Object as any).entries(obj).reduce((acc, [key, val]) => {
    if (key === 'OR') {
      if (val instanceof Array) {
        acc[Sequelize.Op.or] = val.map(convert);
      } else {
        acc[Sequelize.Op.or] = convert(val);
      }
    } else if (key === 'AND') {
      if (val instanceof Array) {
        acc[Sequelize.Op.and] = val.map(convert);
      } else {
        acc[Sequelize.Op.and] = convert(val);
      }
    } else {
      const allowedKeys = ['eq', 'ne', 'gt', 'gte', 'lt', 'lte'];
      const theVal = (Object as any).entries(val).reduce((acc, [key, val]) => {
        if (allowedKeys.indexOf(key) >= 0) {
          acc[Sequelize.Op[key]] = val;
        } else {
          acc[key] = val;
        }
        return acc;
      }, {});

      acc.data = {
        ...(acc.data || {}),
        [key]: {
          ...((acc.data && acc.data[key]) || {}),
          ...theVal,
        },
      };
    }
    return acc;
  }, {});

  function fromBufferContentEntry(contentTypeId: number, id: number): Promise<ContentEntry> {
    clearTimeout(contentTypeTimouts.get(contentTypeId));
    return new Promise((resolve: Function) => {
      if (!contentTypeBuffers.has(contentTypeId)) {
        contentTypeBuffers.set(contentTypeId, []);
      }
      const contentTypeBuffer = contentTypeBuffers.get(contentTypeId);
      contentTypeBuffer.push({ resolve, id });
      contentTypeTimouts.set(contentTypeId, setTimeout(async () => {
        const contentEntryResult = await ContentEntry.findAll({
          where: {
            id: contentTypeBuffer.map(n => n.id),
            contentTypeId,
          },
        });
        contentEntryResult.forEach((entry) => {
          let index = contentTypeBuffer.length  - 1;
          while (index >= 0) {
            const contentTypeBufferItem = contentTypeBuffer[index];
            if (contentTypeBufferItem.id === entry.id) {
              contentTypeBufferItem.resolve(entry);
              contentTypeBuffer.splice(index, 1);
            }
            index -= 1;
          }
        });
      }, 1));
    });
  }

  const inputs = {} as any;
  const fields = {} as any;
  const contentTypes = await ContentType.findAll();
  await Promise.all(
    contentTypes.map(async (type) => {
      const contentTypeFields = await type.$get('fields') as ContentTypeField[];
      const gqlType = new GraphQLObjectType({
        name: type.name,
        fields: () => ({
          id: { type: GraphQLID },
          ...contentTypeFields.reduce((acc, field: ContentTypeField) => {
            if (field.type === 'string') {
              acc[field.name] = {
                type: GraphQLString,
              };
            }
            if (field.type === 'document') {
              acc[field.name] = {
                type: fields[field.options.contentType].type,
                async resolve(opts) {
                  const ct = contentTypes.find(t => t.name === field.options.contentType);
                  const entry = await fromBufferContentEntry(ct && ct.id, opts[field.name]);
                  if (entry) {
                    return {
                      id: entry.id,
                      ...entry.data
                    };
                  }

                  return null;
                }
              };
            }
            return acc;
          }, {}),
        }),
      });

      fields[type.name] = {
        type: gqlType,
        args: {
          id: { type: GraphQLID },
        },
        async resolve(root, args, context, info) {
          const entry = await ContentEntry.find({
            where: {
              contentTypeId: type.id,
              id: args.id,
            },
          });

          if (entry) {
            return {
              id: entry.id,
              ...entry.data
            };
          }

          return null;
        },
      };

      // Sort By Type
      const sortByType = new GraphQLEnumType({
        name: `SortBy_${type.name}`,
        values: contentTypeFields.reduce((acc, field: ContentTypeField) => {
          acc[`${field.name}_ASC`] = { value: [field.name, 'ASC'] };
          acc[`${field.name}_DESC`] = { value: [field.name, 'DESC'] };
          return acc;
        }, {}),
      });

      const whereOpTypesFields = contentTypeFields.reduce((acc, field: ContentTypeField) => {
        if (field.type === 'string') {
          acc[field.name] = { type: whereStringOp };
        }
        if (field.type === 'number') {
          acc[field.name] = { type: whereNumberOp };
        }
        return acc;
      }, {});

      const whereType = new GraphQLInputObjectType({
        name: `Where_${type.name}`,
        fields: () => ({
          ...whereOpTypesFields,
          OR: { type: new GraphQLList(whereType) },
          AND: { type: new GraphQLList(whereType) },
        }),
      });

      fields[`all${type.name}`] = {
        type: new GraphQLList(gqlType),
        args: {
          sortBy: { type: sortByType },
          where: { type: whereType },
          first: { type: GraphQLInt },
          skip: { type: GraphQLInt },
        },
        async resolve(root, args, context, info) {
          const findAllOptions: IFindOptions<ContentEntry> = {};

          if (args.sortBy) {
            const [fieldName, sortOrder] = args.sortBy;
            findAllOptions.order = [
              [sequelize.json(`data.${fieldName}`), sortOrder],
            ];
          }

          if (args.first) {
            if (args.skip) {
              findAllOptions.offset = args.skip;
            }
            findAllOptions.limit = args.first;
          }

          if (args.where) {
            findAllOptions.where = convert(args.where);
          }

          findAllOptions.where = {
            [Sequelize.Op.and]: [{
              contentTypeId: type.id,
            }, findAllOptions.where],
          };

          const entries = await ContentEntry.findAll(findAllOptions);

          return entries.map(entry => ({
            id: entry.id,
            ...entry.data,
          }));
        }
      };

      inputs[`create${type.name}`] = {
        type: gqlType,
        args: {
          input: {
            type: new GraphQLInputObjectType({
              name: `Create${type.name}`,
              fields: contentTypeFields.reduce((acc, field: ContentTypeField) => {
                if (field.type === 'string') {
                  acc[field.name] = {
                    type: GraphQLString,
                  };
                }
                return acc;
              }, {}),
            }),
          },
        },
        async resolve(root, args, context, info) {
          const entry = await ContentEntry.create({
            contentTypeId: type.id,
            data: args.input,
          });

          if (entry) {
            return {
              id: entry.id,
              ...entry.data
            };
          }

          return null;
        },
      };

      inputs[`update${type.name}`] = {
        type: gqlType,
        args: {
          id: { type: GraphQLID },
          input: {
            type: new GraphQLInputObjectType({
              name: `Update${type.name}`,
              fields: contentTypeFields.reduce((acc, field: ContentTypeField) => {
                if (field.type === 'string') {
                  acc[field.name] = {
                    type: GraphQLString,
                  };
                }
                return acc;
              }, {}),
            }),
          },
        },
        async resolve(root, args, context, info) {
          const entry = await ContentEntry.find({
            where: {
              contentTypeId: type.id,
              id: args.id,
            },
          });

          if (entry) {
            entry.update({
              data: args.input,
            });

            return {
              id: entry.id,
              ...entry.data
            };
          }

          return null;
        },
      };

      inputs[`delete${type.name}`] = {
        type: GraphQLInt,
        args: {
          id: { type: GraphQLID },
        },
        async resolve(root, args, context, info) {
          const entry = await ContentEntry.find({
            where: {
              contentTypeId: type.id,
              id: args.id,
            },
          });

          if (entry) {
            entry.destroy();
            return 1;
          }

          return 0;
        },
      };

    }),
  );

  const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
      name: 'Query',
      fields,
    }),
    mutation: new GraphQLObjectType({
      name: 'Mutation',
      fields: inputs,
    }),
  });

  console.log(printSchema(schema));

  return new ApolloServer({
    introspection: true,
    schema,
  });
}
