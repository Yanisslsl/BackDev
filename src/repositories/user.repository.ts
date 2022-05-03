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
import {User, Meet, AppFile} from '../models';
import {MeetRepository} from './meet.repository';
import {AppFileRepository} from './app-file.repository';

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

  public readonly appFiles: HasManyRepositoryFactory<AppFile, typeof User.prototype.id>;

  constructor(
    @inject(`datasources.${UserServiceBindings.DATASOURCE_NAME}`)
    dataSource: juggler.DataSource,
    @repository.getter('UserCredentialsRepository')
    protected userCredentialsRepositoryGetter: Getter<UserCredentialsRepository>, @repository.getter('MeetRepository') protected meetRepositoryGetter: Getter<MeetRepository>, @repository.getter('AppFileRepository') protected appFileRepositoryGetter: Getter<AppFileRepository>,
  ) {
    super(User, dataSource);
    this.appFiles = this.createHasManyRepositoryFactoryFor('appFiles', appFileRepositoryGetter,);
    this.registerInclusionResolver('appFiles', this.appFiles.inclusionResolver);
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
