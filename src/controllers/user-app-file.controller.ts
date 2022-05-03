import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  getWhereSchemaFor,
  param,
  patch,
  post,
  requestBody,
} from '@loopback/rest';
import {
  User,
  AppFile,
} from '../models';
import {UserRepository} from '../repositories';

export class UserAppFileController {
  constructor(
    @repository(UserRepository) protected userRepository: UserRepository,
  ) { }

  @get('/users/{id}/app-files', {
    responses: {
      '200': {
        description: 'Array of User has many AppFile',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(AppFile)},
          },
        },
      },
    },
  })
  async find(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<AppFile>,
  ): Promise<AppFile[]> {
    return this.userRepository.appFiles(id).find(filter);
  }

  @post('/users/{id}/app-files', {
    responses: {
      '200': {
        description: 'User model instance',
        content: {'application/json': {schema: getModelSchemaRef(AppFile)}},
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof User.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(AppFile, {
            title: 'NewAppFileInUser',
            exclude: ['id'],
            optional: ['userId']
          }),
        },
      },
    }) appFile: Omit<AppFile, 'id'>,
  ): Promise<AppFile> {
    return this.userRepository.appFiles(id).create(appFile);
  }

  @patch('/users/{id}/app-files', {
    responses: {
      '200': {
        description: 'User.AppFile PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(AppFile, {partial: true}),
        },
      },
    })
    appFile: Partial<AppFile>,
    @param.query.object('where', getWhereSchemaFor(AppFile)) where?: Where<AppFile>,
  ): Promise<Count> {
    return this.userRepository.appFiles(id).patch(appFile, where);
  }

  @del('/users/{id}/app-files', {
    responses: {
      '200': {
        description: 'User.AppFile DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(AppFile)) where?: Where<AppFile>,
  ): Promise<Count> {
    return this.userRepository.appFiles(id).delete(where);
  }
}
