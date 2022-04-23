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
  Meet,
} from '../models';
import {UserRepository} from '../repositories';

export class UserMeetController {
  constructor(
    @repository(UserRepository) protected userRepository: UserRepository,
  ) { }

  @get('/users/{id}/meets', {
    responses: {
      '200': {
        description: 'Array of User has many Meet',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Meet)},
          },
        },
      },
    },
  })
  async find(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<Meet>,
  ): Promise<Meet[]> {
    return this.userRepository.meets(id).find(filter);
  }

  @post('/users/{id}/meets', {
    responses: {
      '200': {
        description: 'User model instance',
        content: {'application/json': {schema: getModelSchemaRef(Meet)}},
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof User.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Meet, {
            title: 'NewMeetInUser',
            exclude: ['id'],
            optional: ['userId']
          }),
        },
      },
    }) meet: Omit<Meet, 'id'>,
  ): Promise<Meet> {
    return this.userRepository.meets(id).create(meet);
  }

  @patch('/users/{id}/meets', {
    responses: {
      '200': {
        description: 'User.Meet PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Meet, {partial: true}),
        },
      },
    })
    meet: Partial<Meet>,
    @param.query.object('where', getWhereSchemaFor(Meet)) where?: Where<Meet>,
  ): Promise<Count> {
    return this.userRepository.meets(id).patch(meet, where);
  }

  @del('/users/{id}/meets', {
    responses: {
      '200': {
        description: 'User.Meet DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(Meet)) where?: Where<Meet>,
  ): Promise<Count> {
    return this.userRepository.meets(id).delete(where);
  }
}
