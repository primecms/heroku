import { Model, Column, Table, Scopes, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { ContentType } from './ContentType';
import { JSON } from 'sequelize';

@Scopes({
  contentType: {
    include: [{
      model: () => ContentType,
      through: { attributes: [] },
    }],
  },
})
@Table
export class ContentEntry extends Model<ContentEntry> {

  @Column
  @ForeignKey(() => ContentType)
  contentTypeId: number;

  @Column
  language: string;

  @Column(JSON)
  data;

  @BelongsTo(() => ContentType)
  contentType: ContentType;
}
