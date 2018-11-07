import { ApolloServer } from 'apollo-server';
import { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLList, GraphQLID } from 'graphql';

import { ContentType } from './models/ContentType';
import { ContentEntry } from './models/ContentEntry';
import { ContentTypeField } from './models/ContentTypeField';

export const server = async () => {

  const contentTypeBuffers = new Map();
  const contentTypeTimouts = new Map();

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

      fields[`all${type.name}`] = {
        type: new GraphQLList(gqlType),
        async resolve(root, args, context, info) {
          const entries = await ContentEntry.findAll({
            where: {
              contentTypeId: type.id,
            },
          });
          return entries.map(entry => ({
            id: entry.id,
            ...entry.data,
          }));
        }
      };
    })
  );

  return new ApolloServer({
    schema: new GraphQLSchema({
      query: new GraphQLObjectType({
        name: 'Query',
        fields,
      }),
    }),
  });
}
