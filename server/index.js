import { createServer } from "node:http";
import { createSchema, createYoga, createPubSub } from "graphql-yoga";
import * as data from "./data.json" assert { type: "json" };
import { nanoid } from "nanoid";

const { events, locations, users, participants } = data.default;

const typeDefs = `#graphql
type Event {
    id: ID!
    title: String!
    desc: String!
    date: String!
    from: String!
    to: String!
    location_id: ID!
    location: Location!
    user_id: ID!
    user: User!
    participants: [Participant!]!
  }
  type Location {
    id: ID!
    name: String!
    desc: String!
    lat: Float!
    lng: Float!
  }
  type User {
    id: ID!
    username: String!
    email: String!
    events: [Event!]!
  }
  type Participant {
    id: ID!
    event_id: ID!
    event: Event!
    user_id: ID!
    user: User!
  }

  # Queries
  type Query {
    events: [Event!]!
    event(id: ID!): Event!
    locations: [Location!]!
    location(id: ID!): Location!
    users: [User!]!
    user(id: ID!): User!
    participants: [Participant!]!
    participant(id: ID!): Participant!
  }
  # User inputs
  input createUserInput {
    username: String!
  }
  input updateUserInput {
    id: ID!
    username: String
    email: String
  }
  # Event inputs
  input createEventInput {
    title: String!
    desc: String!
    date: String!
  }
  input updateEventInput {
    id: ID!
    title: String
    desc: String
    date: String

    from: String
    to: String
    location_id: ID
    user_id: ID
  }
  # Participant inputs
  input createParticipantInput {
    event_id: ID!
    user_id: ID!
  }
  input updateParticipantInput {
    id: ID!
    event_id: ID
    user_id: ID
  }
  # Location inputs
  input createLocationInput {
    name: String!
    desc: String!
  }
  input updateLocationInput {
    id: ID!
    name: String
    desc: String
    lat: Float
    lng: Float
  }

  # Mutations
  type Mutation {
    # User mutations types
    createUser(input: createUserInput!): User!
    updateUser(input: updateUserInput!): User!
    deleteUser(id: ID!): User!
    deleteAllUsers: Int!
    # Event mutations types
    createEvent(input: createEventInput!): Event!
    updateEvent(input: updateEventInput!): Event!
    deleteEvent(id: ID!): Event!
    deleteAllEvents: Int!
    # Participant mutations types
    createParticipant(input: createParticipantInput): Participant!
    updateParticipant(input: updateParticipantInput): Participant!
    deleteParticipant(id: ID!): Participant!
    deleteAllParticipants: Int!
    # Location mutations types
    createLocation(input: createLocationInput): Location!
    updateLocation(input: updateLocationInput): Location!
    deleteLocation(id: ID!): Location!
    deleteAllLocations: Int!
  }

  # Subscriptions types
  type Subscription {
    # User subscriptions types
    userCreated: User!
    userUpdated: User!
    userDeleted: User!
    # Event subscriptions types
    eventCreated: Event!
    eventUpdated: Event!
    eventDeleted: Event!
    # Participant subscriptions types
    participantCreated: Participant!
    participantUpdated: Participant!
    participantDeleted: Participant!
    # Location subscriptions types
    locationCreated: Location!
    locationUpdated: Location!
    locationDeleted: Location!
  }
`;

const pubSub = createPubSub();

const resolvers = {
  Subscription: {
    userCreated: {
      subscribe: () => pubSub.subscribe("userCreated"),
    },
    userUpdated: {
      subscribe: () => pubSub.subscribe("userUpdated"),
    },
    userDeleted: {
      subscribe: () => pubSub.subscribe("userDeleted"),
    },
    // Event subscriptions
    eventCreated: {
      subscribe: () => pubSub.subscribe("eventCreated"),
    },
    eventUpdated: {
      subscribe: () => pubSub.subscribe("eventUpdated"),
    },
    eventDeleted: {
      subscribe: () => pubSub.subscribe("eventDeleted"),
    },
    participantCreated: {
      subscribe: () => pubSub.subscribe("participantCreated"),
    },
    participantUpdated: {
      subscribe: () => pubSub.subscribe("participantUpdated"),
    },
    participantDeleted: {
      subscribe: () => pubSub.subscribe("participantDeleted"),
    },
    locationCreated: {
      subscribe: () => pubSub.subscribe("locationCreated"),
    },
    locationUpdated: {
      subscribe: () => pubSub.subscribe("locationUpdated"),
    },
    locationDeleted: {
      subscribe: () => pubSub.subscribe("locationDeleted"),
    },
  },
  Mutation: {
    // User mutations
    createUser: (parent, args, context, info) => {
      const user = {
        id: nanoid(),
        username: args.input.username,
      };
      users.push(user);
      return user;
    },
    updateUser: (parent, args, context, info) => {
      console.log(users);
      let userIndex = users.findIndex((user) => user.id === args.input.id);

      if (userIndex === -1) {
        throw new Error(`Couldn't find user with id ${args.id}`);
      }
      users[userIndex] = { ...users[userIndex], ...args.input };
      return users[userIndex];
    },
    deleteUser: (parent, args, context, info) => {
      const userIndex = users.findIndex((user) => user.id === args.id);
      if (userIndex === -1) {
        throw new Error(`Couldn't find user with id ${args.id}`);
      }
      const deletedUsers = users.splice(userIndex, 1);
      return deletedUsers[0];
    },
    deleteAllUsers: (parent, args, context, info) => {
      const deletedUsers = users.splice(0, users.length);
      return deletedUsers.length;
    },
    // Event mutations
    createEvent: (parent, args, context, info) => {
      const event = {
        id: nanoid(),
        title: args.input.title,
        desc: args.input.desc,
        date: args.input.date,
      };
      events.push(event);
      return event;
    },
    updateEvent: (parent, args, context, info) => {
      let eventIndex = events.findIndex((event) => event.id === args.input.id);
      if (eventIndex === -1) {
        throw new Error(`Couldn't find event with id ${args.id}`);
      }
      events[eventIndex] = { ...events[eventIndex], ...args.input };
      return events[eventIndex];
    },
    deleteEvent: (parent, args, context, info) => {
      const eventIndex = events.findIndex((event) => event.id === args.id);
      if (eventIndex === -1) {
        throw new Error(`Couldn't find event with id ${args.id}`);
      }
      const deletedEvents = events.splice(eventIndex, 1);
      return deletedEvents[0];
    },
    deleteAllEvents: (parent, args, context, info) => {
      const deletedEvents = events.splice(0, events.length);
      return deletedEvents.length;
    },
    // Participant mutations
    createParticipant: (parent, args, context, info) => {
      const participant = {
        id: nanoid(),
        event_id: args.input.event_id,
        user_id: args.input.user_id,
      };
      participants.push(participant);
      return participant;
    },
    updateParticipant: (parent, args, context, info) => {
      let participantIndex = participants.findIndex((participant) => participant.id === args.input.id);
      if (participantIndex === -1) {
        throw new Error(`Couldn't find participant with id ${args.id}`);
      }
      participants[participantIndex] = {
        ...participants[participantIndex],
        ...args.input,
      };
      return participants[participantIndex];
    },
    deleteParticipant: (parent, args, context, info) => {
      const participantIndex = participants.findIndex((participant) => participant.id === args.id);
      if (participantIndex === -1) {
        throw new Error(`Couldn't find participant with id ${args.id}`);
      }
      const deletedParticipants = participants.splice(participantIndex, 1);
      return deletedParticipants[0];
    },
    deleteAllParticipants: (parent, args, context, info) => {
      const deletedParticipants = participants.splice(0, participants.length);
      return deletedParticipants.length;
    },
    // Location mutations
    createLocation: (parent, args, context, info) => {
      const location = {
        id: nanoid(),
        name: args.input.name,
        desc: args.input.desc,
      };
      locations.push(location);
      return location;
    },
    updateLocation: (parent, args, context, info) => {
      let locationIndex = locations.findIndex((location) => location.id === args.input.id);
      if (locationIndex === -1) {
        throw new Error(`Couldn't find location with id ${args.id}`);
      }
      locations[locationIndex] = { ...locations[locationIndex], ...args.input };
      return locations[locationIndex];
    },
    deleteLocation: (parent, args, context, info) => {
      const locationIndex = locations.findIndex((location) => location.id === args.id);
      if (locationIndex === -1) {
        throw new Error(`Couldn't find location with id ${args.id}`);
      }
      const deletedLocations = locations.splice(locationIndex, 1);
      return deletedLocations[0];
    },
    deleteAllLocations: (parent, args, context, info) => {
      const deletedLocations = locations.splice(0, locations.length);
      return deletedLocations.length;
    },
  },
  Query: {
    events: () => events,
    event: (parent, args, context, info) => {
      return events.find((event) => event.id === args.id);
    },

    locations: () => locations,
    location: (parent, args, context, info) => {
      return locations.find((location) => location.id === args.id);
    },

    users: () => users,
    user: (parent, args, context, info) => {
      return users.find((user) => user.id === args.id);
    },

    participants: () => participants,
    participant: (parent, args, context, info) => {
      return participants.find((participant) => participant.id === args.id);
    },
  },
  Event: {
    location: (parent, args, context, info) => {
      return locations.find((location) => location.id === parent.location_id);
    },
    user: (parent, args, context, info) => {
      return users.find((user) => user.id === parent.user_id);
    },
    participants: (parent, args, context, info) => {
      return participants.filter((participant) => participant.event_id === parent.id);
    },
  },

  User: {
    events: (parent, args, context, info) => {
      return events.filter((event) => event.user_id === parent.id);
    },
  },

  Participant: {
    event: (parent, args, context, info) => {
      return events.find((event) => event.id === parent.event_id);
    },
    user: (parent, args, context, info) => {
      return users.find((user) => user.id === parent.user_id);
    },
  },
};

const yoga = createYoga({
  schema: createSchema({ typeDefs, resolvers }),
  context: { pubSub },
  graphqlEndpoint: "/",
  cors: {
    origin: "*",
  },
});

const server = createServer(yoga);
server.listen(3000);
