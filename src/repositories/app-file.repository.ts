import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongoDsDataSource} from '../datasources';
import {AppFile, AppFileRelations} from '../models';

export class AppFileRepository extends DefaultCrudRepository<
  AppFile,
  typeof AppFile.prototype.id,
  AppFileRelations
> {
  constructor(
    @inject('datasources.mongo_ds') dataSource: MongoDsDataSource,
  ) {
    super(AppFile, dataSource);
  }
}
