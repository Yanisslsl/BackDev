import {Entity, model, property} from '@loopback/repository';

@model({settings: {strict: false}})
export class Meet extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id?: string;

  @property({
    type: 'boolean',
  })
  matched?: boolean;

  @property({
    type: 'string',
  })
  userId?: string;
  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<Meet>) {
    super(data);
  }
}

export interface MeetRelations {
  // describe navigational properties here
}

export type MeetWithRelations = Meet & MeetRelations;
