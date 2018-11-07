import { Model, Column, Table, HasMany } from 'sequelize-typescript';
import { ContentEntry } from './ContentEntry';
import { ContentTypeField } from './ContentTypeField';

@Table
export class ContentType extends Model<ContentType> {

  @Column
  name: string;

  @HasMany(() => ContentEntry)
  contentEntry: ContentEntry;

  @HasMany(() => ContentTypeField)
  fields: ContentTypeField[];
}
