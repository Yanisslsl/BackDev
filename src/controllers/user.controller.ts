import {authenticate, TokenService} from '@loopback/authentication';
import {
  TokenServiceBindings,
  UserRelations,
  UserServiceBindings,
} from '@loopback/authentication-jwt';
import {inject} from '@loopback/core';
import {
  Filter,
  FilterExcludingWhere,
  model,
  property,
  repository,
} from '@loopback/repository';
import {
  get,
  getModelSchemaRef,
  param,
  patch,
  post,
  requestBody,
  response,
  SchemaObject,
} from '@loopback/rest';
import {SecurityBindings, securityId, UserProfile} from '@loopback/security';
import {genSalt, hash} from 'bcryptjs';
import _ from 'lodash';
import {AppFile, Meet} from '../models';
import {User} from '../models/user.model';
import {
  ConversationRepository,
  MeetRepository,
  UserRepository,
} from '../repositories';
import findDistance from '../services/location.service';
import {CustomUserService} from '../services/user.service';
@model()
export class NewUserRequest extends User {
  @property({
    type: 'string',
    required: true,
  })
  password: string;

  @property({
    type: 'string',
    required: true,
  })
  name: string;
}

const CredentialsSchema: SchemaObject = {
  type: 'object',
  required: ['email', 'password'],
  properties: {
    email: {
      type: 'string',
      format: 'email',
    },
    password: {
      type: 'string',
      minLength: 8,
    },
  },
};

export const CredentialsRequestBody = {
  description: 'The input of login function',
  required: true,
  content: {
    'application/json': {schema: CredentialsSchema},
  },
};

export class UserController {
  constructor(
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public jwtService: TokenService,
    @inject(UserServiceBindings.USER_SERVICE)
    public userService: CustomUserService,
    @inject(SecurityBindings.USER, {optional: true})
    public user: UserProfile,
    @repository(UserRepository) protected userRepository: UserRepository,
    @repository(MeetRepository)
    public meetRepository: MeetRepository,
    @repository(ConversationRepository)
    public conversationRepository: ConversationRepository,
  ) {}

  @post('/users/login', {
    responses: {
      '200': {
        description: 'Token',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                token: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
    },
  })
  async login(
    @requestBody(CredentialsRequestBody) credentials: any,
  ): Promise<{
    token: string;
    id: string;
    email: string;
    name: string;
    image: string;
  }> {
    // ensure the user exists, and the password is correct
    const user = await this.userService.verifyCredentials(credentials);
    console.log(credentials);
    // convert a User object into a UserProfile object (reduced set of properties)
    const userProfile = this.userService.convertToUserProfile(user);
    console.log(user);
    const newUser = this.userRepository.updateById(user.id, {
      location: credentials.location,
    });
    // create a JSON Web Token based on the user profile
    const token = await this.jwtService.generateToken(userProfile);
    return {
      token,
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
    };
  }

  @authenticate('jwt')
  @get('/whoAmI', {
    responses: {
      '200': {
        description: 'Return current user',
        content: {
          'application/json': {
            schema: {
              type: 'string',
            },
          },
        },
      },
    },
  })
  async whoAmI(
    @inject(SecurityBindings.USER)
    currentUserProfile: UserProfile,
  ): Promise<string> {
    return currentUserProfile[securityId];
  }

  @get('/users/{id}')
  @response(200, {
    description: 'Meet model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(User, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(User, {exclude: 'where'}) filter?: FilterExcludingWhere<User>,
  ): Promise<User> {
    return this.userRepository.findById(id, filter);
  }

  @post('/signup', {
    responses: {
      '200': {
        description: 'User',
        content: {
          'application/json': {
            schema: {
              'x-ts-type': User,
            },
          },
        },
      },
    },
  })
  async signUp(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(NewUserRequest, {
            title: 'NewUser',
          }),
        },
      },
    })
    newUserRequest: NewUserRequest,
  ): Promise<User> {
    const password = await hash(newUserRequest.password, await genSalt());
    const savedUser = await this.userRepository.create(
      _.omit(newUserRequest, 'password'),
    );

    await this.userRepository.userCredentials(savedUser.id).create({password});

    return savedUser;
  }

  @patch('/users/{id}')
  @response(204, {
    description: 'user PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {partial: true}),
        },
      },
    })
    user: User,
  ): Promise<void> {
    await this.userRepository.updateById(id, user);
  }

  @get('/users/{id}/meets')
  @response(200, {
    description: 'Array of Meet model instances',
  })
  async findMeets(@param.path.string('id') id: string): Promise<UserRelations> {
    // const user = await this.userRepository.findById(id);
    return this.userRepository.meets(id).find();
  }

  @post('/users/{id}/meets')
  @response(200, {
    description: 'Meet model instance',
    content: {'application/json': {schema: getModelSchemaRef(Meet)}},
  })
  async createMeet(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Meet, {
            title: 'NewMeet',
            exclude: ['id'],
          }),
        },
      },
    })
    meet: Meet,
    @param.path.string('id') userId: string,
  ): Promise<any> {
    const userIds: any = [];
    let userIdsReversed: any = [];
    if (meet.usersIds) {
      meet.usersIds.forEach((userId: string) => {
        userIds.push(userId);
        userIdsReversed.push(userId);
      });
    }
    userIdsReversed = userIdsReversed.reverse();

    const currentMeet: any = await this.meetRepository.findOne({
      where: {
        or: [{usersIds: userIds}, {usersIds: userIdsReversed}],
      },
    });
    if (currentMeet) {
      const res: any = [];
      meet.usersIds?.forEach((userId: string) => {
        res.push(this.userRepository.findById(userId));
      });
      const users = await Promise.all(res);
      const conversation = await this.conversationRepository.create({
        meetId: currentMeet.id,
        users: users,
      });
      const updatedMeet = await this.meetRepository.updateById(currentMeet.id, {
        matchedUserIds: [...currentMeet.matchedUserIds, userId],
        matched: true,
      });
      return {matched: true, ...conversation, updatedMeet};
    }
    meet.matchedUserIds = [];
    meet.matchedUserIds?.push(userId);
    meet.matched = false;
    console.log(meet);
    return this.meetRepository.create(meet);
  }

  @get('/users')
  @response(200, {
    description: 'Array of User model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(User, {includeRelations: true}),
        },
      },
    },
  })
  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      include: [
        {
          relation: 'appFiles',
        },
      ],
    });
  }

  @get('/users/{id}/conversations')
  @response(200, {
    description: 'Array of Meet model instances',
  })
  async findConversations(
    @param.path.string('id') id: string,
  ): Promise<UserRelations> {
    const result: any = [];
    const m = await this.meetRepository.find({
      where: {usersIds: {inq: [`${id}`]}},
    });
    const res: any = [];
    m.forEach((meet: any) => {
      const conv = this.conversationRepository.find({
        where: {meetId: meet.id},
      });
      res.push(conv);
    });

    const t = await Promise.all(res);

    const u = t.flat(2);

    return u;
  }

  @get('/me/{id}/users')
  @response(200, {
    description: 'Array of Meet model instances',
  })
  async findUsers(@param.path.string('id') Id: string): Promise<any> {
    const allUsersIds: any = [];
    const result: any = [];
    const final: any = [];
    const currentUser = await this.userRepository.findById(Id);

    const res = await this.meetRepository.find({
      // all meets where user is in and not matched yet
      where: {
        and: [
          {usersIds: {inq: [`${Id}`]}},
          {matchedUserIds: {inq: [`${Id}`]}},
          {matched: false},
        ],
      },
    });
    const allUsers = await this.userRepository.find({});
    allUsers.forEach((user: any) => {
      if (user.id !== Id) {
        allUsersIds.push(user.id);
      }
    });
    const matched = await this.meetRepository.find({
      where: {
        and: [
          {usersIds: {inq: [`${Id}`]}},
          {matchedUserIds: {inq: [`${Id}`]}},
          {matched: true},
        ],
      },
    });
    res.forEach((meet: any) => {
      if (meet.usersIds) {
        meet.usersIds.forEach((userId: any) => {
          if (userId !== Id) {
            result.push(userId);
          }
        });
      }
    });

    matched.forEach((meet: any) => {
      // all users where user is  matched
      if (meet.usersIds) {
        meet.usersIds.forEach((userId: any) => {
          if (userId !== Id) {
            final.push(userId);
          }
        });
      }
    });

    let finalResult = [_.difference(allUsersIds, final), ...result].flat(2);
    const uniqueIds: any = result;
    finalResult = finalResult.filter((id: any) => {
      const isDuplicate = uniqueIds.includes(id);
      if (!isDuplicate) {
        uniqueIds.push(id);
        return true;
      }
      return false;
    });

    const users: any = [];
    finalResult.forEach((userId: any) => {
      users.push(this.userRepository.findById(userId));
    });
    const finalUsers = await Promise.all(users);
    const endResult: any = [];
    finalUsers.forEach((user: any) => {
      if (!user.location) {
        console.log('hello');
        endResult.push(user);
      }
      const distance = findDistance(user.location, currentUser.location);

      console.log(distance, currentUser.locationLimit);

      if (distance < currentUser.locationLimit) {
        console.log('hello1');

        endResult.push(user);
      }
    });
    console.log(endResult);
    return endResult;
  }

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
            optional: ['userId'],
          }),
        },
      },
    })
    appFile: Omit<AppFile, 'id'>,
  ): Promise<AppFile> {
    return this.userRepository.appFiles(id).create(appFile);
  }
}
