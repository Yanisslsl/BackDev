import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, HasManyRepositoryFactory} from '@loopback/repository';
import {MongoDsDataSource} from '../datasources';
import {Conversation, ConversationRelations, Message} from '../models';
import {MessageRepository} from './message.repository';

export class ConversationRepository extends DefaultCrudRepository<
  Conversation,
  typeof Conversation.prototype.id,
  ConversationRelations
> {

  public readonly messages: HasManyRepositoryFactory<Message, typeof Conversation.prototype.id>;

  constructor(
    @inject('datasources.mongo_ds') dataSource: MongoDsDataSource, @repository.getter('MessageRepository') protected messageRepositoryGetter: Getter<MessageRepository>,
  ) {
    super(Conversation, dataSource);
    this.messages = this.createHasManyRepositoryFactoryFor('messages', messageRepositoryGetter,);
    this.registerInclusionResolver('messages', this.messages.inclusionResolver);
  }
}
