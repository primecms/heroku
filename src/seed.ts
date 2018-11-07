import { ContentType } from './models/ContentType';
import { ContentEntry } from './models/ContentEntry';
import { ContentTypeField } from './models/ContentTypeField';

export const seed = async () => {

  const blogType = await ContentType.create({ name: 'Blog' });
  const blogFields = [
    await ContentTypeField.create({
      name: 'title',
      type: 'string',
    }),
    await ContentTypeField.create({
      name: 'description',
      type: 'string',
    }),
    await ContentTypeField.create({
      name: 'author',
      type: 'document',
      options: {
        contentType: 'Author',
      },
    }),
  ];
  await blogType.$add('fields', blogFields);

  // ---

  const authorType = await ContentType.create({ name: 'Author' });
  const authorFields = [
    await ContentTypeField.create({ name: 'name', type: 'string' }),
  ];
  await authorType.$add('fields', authorFields);

  // ---
  const author1 = await ContentEntry.create({
    contentTypeId: authorType.id,
    data: {
      name: 'John',
    }
  });

  const author2 = await ContentEntry.create({
    contentTypeId: authorType.id,
    data: {
      name: 'Paul',
    }
  });

  // --

  await ContentEntry.create({
    contentTypeId: blogType.id,
    data: {
      title: 'Foo 1',
      description: 'Bar 1',
      author: author1.id,
    },
  });

  await ContentEntry.create({
    contentTypeId: blogType.id,
    data: {
      title: 'Foo 2',
      description: 'Bar 2',
      author: author2.id,
    },
  });
}
