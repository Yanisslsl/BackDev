import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongoDsDataSource} from '../datasources';
import {Meet, MeetRelations} from '../models';

export class MeetRepository extends DefaultCrudRepository<
  Meet,
  typeof Meet.prototype.id,
  MeetRelations
> {
  constructor(
    @inject('datasources.mongo_ds') dataSource: MongoDsDataSource,
  ) {
    super(Meet, dataSource);
  }
}
