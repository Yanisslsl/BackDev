import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, HasManyRepositoryFactory} from '@loopback/repository';
import {MongoDsDataSource} from '../datasources';
import {Meet, MeetRelations, User} from '../models';
import {UserRepository} from './user.repository';

export class MeetRepository extends DefaultCrudRepository<
  Meet,
  typeof Meet.prototype.id,
  MeetRelations
> {

  public readonly users: HasManyRepositoryFactory<User, typeof Meet.prototype.id>;

  constructor(
    @inject('datasources.mongo_ds') dataSource: MongoDsDataSource, @repository.getter('UserRepository') protected userRepositoryGetter: Getter<UserRepository>,
  ) {
    super(Meet, dataSource);
    this.users = this.createHasManyRepositoryFactoryFor('users', userRepositoryGetter,);
    this.registerInclusionResolver('users', this.users.inclusionResolver);
  }
}
