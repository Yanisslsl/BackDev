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
  Conversation,
  Message,
} from '../models';
import {ConversationRepository} from '../repositories';

export class ConversationMessageController {
  constructor(
    @repository(ConversationRepository) protected conversationRepository: ConversationRepository,
  ) { }

  @get('/conversations/{id}/messages', {
    responses: {
      '200': {
        description: 'Array of Conversation has many Message',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Message)},
          },
        },
      },
    },
  })
  async find(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<Message>,
  ): Promise<Message[]> {
    return this.conversationRepository.messages(id).find(filter);
  }

  @post('/conversations/{id}/messages', {
    responses: {
      '200': {
        description: 'Conversation model instance',
        content: {'application/json': {schema: getModelSchemaRef(Message)}},
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof Conversation.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Message, {
            title: 'NewMessageInConversation',
            exclude: ['id'],
            optional: ['conversationId']
          }),
        },
      },
    }) message: Omit<Message, 'id'>,
  ): Promise<Message> {
    return this.conversationRepository.messages(id).create(message);
  }

  @patch('/conversations/{id}/messages', {
    responses: {
      '200': {
        description: 'Conversation.Message PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Message, {partial: true}),
        },
      },
    })
    message: Partial<Message>,
    @param.query.object('where', getWhereSchemaFor(Message)) where?: Where<Message>,
  ): Promise<Count> {
    return this.conversationRepository.messages(id).patch(message, where);
  }

  @del('/conversations/{id}/messages', {
    responses: {
      '200': {
        description: 'Conversation.Message DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(Message)) where?: Where<Message>,
  ): Promise<Count> {
    return this.conversationRepository.messages(id).delete(where);
  }
}
