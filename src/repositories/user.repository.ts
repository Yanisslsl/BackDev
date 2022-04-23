import {
  UserCredentials,
  UserCredentialsRepository,
  UserRelations,
  UserServiceBindings,
} from '@loopback/authentication-jwt';
import {Getter, inject} from '@loopback/core';
import {
  DefaultCrudRepository,
  HasOneRepositoryFactory,
  juggler,
  repository, HasManyRepositoryFactory} from '@loopback/repository';
import {User, Meet} from '../models';
import {MeetRepository} from './meet.repository';

export class UserRepository extends DefaultCrudRepository<
  User,
  typeof User.prototype.id,
  UserRelations
> {
  public readonly userCredentials: HasOneRepositoryFactory<
    UserCredentials,
    typeof User.prototype.id
  >;

  public readonly meets: HasManyRepositoryFactory<Meet, typeof User.prototype.id>;

  constructor(
    @inject(`datasources.${UserServiceBindings.DATASOURCE_NAME}`)
    dataSource: juggler.DataSource,
    @repository.getter('UserCredentialsRepository')
    protected userCredentialsRepositoryGetter: Getter<UserCredentialsRepository>, @repository.getter('MeetRepository') protected meetRepositoryGetter: Getter<MeetRepository>,
  ) {
    super(User, dataSource);
    this.meets = this.createHasManyRepositoryFactoryFor('meets', meetRepositoryGetter,);
    this.registerInclusionResolver('meets', this.meets.inclusionResolver);
    this.userCredentials = this.createHasOneRepositoryFactoryFor(
      'userCredentials',
      userCredentialsRepositoryGetter,
    );
    this.registerInclusionResolver(
      'userCredentials',
      this.userCredentials.inclusionResolver,
    );
  }

  async findCredentials(
    userId: typeof User.prototype.id,
  ): Promise<UserCredentials | undefined> {
    try {
      return await this.userCredentials(userId).get();
    } catch (err) {
      if (err.code === 'ENTITY_NOT_FOUND') {
        return undefined;
      }
      throw err;
    }
  }
}
