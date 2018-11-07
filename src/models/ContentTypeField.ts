import { Model, Column, Table, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { ContentType } from './ContentType';
import { JSON } from 'sequelize';

@Table
export class ContentTypeField extends Model<ContentTypeField> {

  @Column
  name: string;

  @Column
  type: string;

  @ForeignKey(() => ContentType)
  @Column
  contentTypeId: number;

  @BelongsTo(() => ContentType)
  contentType: ContentType;

  @Column(JSON)
  options;
}
