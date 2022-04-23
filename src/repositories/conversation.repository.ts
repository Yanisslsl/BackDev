import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongoDsDataSource} from '../datasources';
import {Conversation, ConversationRelations} from '../models';

export class ConversationRepository extends DefaultCrudRepository<
  Conversation,
  typeof Conversation.prototype.id,
  ConversationRelations
> {
  constructor(
    @inject('datasources.mongo_ds') dataSource: MongoDsDataSource,
  ) {
    super(Conversation, dataSource);
  }
}
