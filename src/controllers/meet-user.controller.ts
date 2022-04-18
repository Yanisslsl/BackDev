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
  Meet,
  User,
} from '../models';
import {MeetRepository} from '../repositories';

export class MeetUserController {
  constructor(
    @repository(MeetRepository) protected meetRepository: MeetRepository,
  ) { }

  @get('/meets/{id}/users', {
    responses: {
      '200': {
        description: 'Array of Meet has many User',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(User)},
          },
        },
      },
    },
  })
  async find(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<User>,
  ): Promise<User[]> {
    return this.meetRepository.users(id).find(filter);
  }

  @post('/meets/{id}/users', {
    responses: {
      '200': {
        description: 'Meet model instance',
        content: {'application/json': {schema: getModelSchemaRef(User)}},
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof Meet.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {
            title: 'NewUserInMeet',
            exclude: ['id'],
            optional: ['meetId']
          }),
        },
      },
    }) user: Omit<User, 'id'>,
  ): Promise<User> {
    return this.meetRepository.users(id).create(user);
  }

  @patch('/meets/{id}/users', {
    responses: {
      '200': {
        description: 'Meet.User PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {partial: true}),
        },
      },
    })
    user: Partial<User>,
    @param.query.object('where', getWhereSchemaFor(User)) where?: Where<User>,
  ): Promise<Count> {
    return this.meetRepository.users(id).patch(user, where);
  }

  @del('/meets/{id}/users', {
    responses: {
      '200': {
        description: 'Meet.User DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(User)) where?: Where<User>,
  ): Promise<Count> {
    return this.meetRepository.users(id).delete(where);
  }
}
