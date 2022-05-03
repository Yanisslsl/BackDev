import {Entity, model, property} from '@loopback/repository';

@model({settings: {strict: false}})
export class AppFile extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id?: string;

  @property({
    type: 'string',
    required: true,
  })
  type: string;

  @property({
    type: 'string',
    required: true,
  })
  src: string;

  @property({
    type: 'string',
  })
  userId?: string;
  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<AppFile>) {
    super(data);
  }
}

export interface AppFileRelations {
  // describe navigational properties here
}

export type AppFileWithRelations = AppFile & AppFileRelations;
