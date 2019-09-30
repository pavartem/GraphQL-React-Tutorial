const graphql = require('graphql');

const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLSchema,
    GraphQLID,
    GraphQLInt,
    GraphQLList,
    GraphQLNonNull,
    GraphQLBoolean,
} = graphql;

const Movies = require('../models/movie');
const Directors = require('../models/director');

const MovieType = new GraphQLObjectType({
    name: 'Movie',
    fields: () => ({
        id: {type: GraphQLID},
        name: {type: new GraphQLNonNull(GraphQLString)},
        genre: {type: new GraphQLNonNull(GraphQLString)},
        watched: {type: new GraphQLNonNull(GraphQLBoolean)},
        rate: {type: GraphQLInt},
        director: {
            type: DirectorType,
            resolve(parent, args) {
                return Directors.findById(parent.directorId);
            }
        }
    })
});

const DirectorType = new GraphQLObjectType({
    name: 'Director',
    fields: () => ({
        id: {type: GraphQLID},
        name: {type: new GraphQLNonNull(GraphQLString)},
        age: {type: new GraphQLNonNull(GraphQLInt)},
        movies: {
            type: new GraphQLList(MovieType),
            resolve(parent, args) {
                return Movies.find({directorId: parent.id});
            }
        }
    })
});

const Mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        addDirector: {
            type: DirectorType,
            args: {
                name: {type: new GraphQLNonNull(GraphQLString)},
                age: {type: new GraphQLNonNull(GraphQLInt)},
            },
            resolve(parent, args) {
                const {name, age} = args;
                const director = new Directors({
                    name,
                    age,
                });
                return director.save();
            }
        },
        addMovie: {
            type: MovieType,
            args: {
                name: {type: new GraphQLNonNull(GraphQLString)},
                genre: {type: new GraphQLNonNull(GraphQLString)},
                directorId: {type: GraphQLID},
                watched: {type: new GraphQLNonNull(GraphQLBoolean)},
                rate: {type: GraphQLInt},
            },
            resolve(parent, args) {
                const {name, genre, directorId, watched, rate} = args;
                const movie = new Movies({
                    name,
                    genre,
                    directorId,
                    watched,
                    rate,
                });
                return movie.save();
            }
        },
        deleteDirector: {
            type: DirectorType,
            args: {id: {type: GraphQLID}},
            resolve(parent, args) {
                return Directors.findByIdAndRemove(args.id);
            }
        },
        deleteMovie: {
            type: MovieType,
            args: {id: {type: GraphQLID}},
            resolve(parent, args) {
                return Movies.findByIdAndRemove(args.id);
            }
        },
        updateDirector: {
            type: DirectorType,
            args: {
                id: {type: GraphQLID},
                name: {type: new GraphQLNonNull(GraphQLString)},
                age: {type: new GraphQLNonNull(GraphQLInt)},
            },
            resolve(parent, args) {
                const {name, age} = args;
                return Directors.findByIdAndUpdate(
                    args.id,
                    {$set: {name, age}},
                    {new: true},
                );
            }
        },
        updateMovie: {
            type: MovieType,
            args: {
                id: {type: GraphQLID},
                name: {type: new GraphQLNonNull(GraphQLString)},
                genre: {type: new GraphQLNonNull(GraphQLString)},
                directorId: {type: GraphQLID},
                watched: {type: new GraphQLNonNull(GraphQLBoolean)},
                rate: {type: GraphQLInt},
            },
            resolve(parent, args) {
                const {name, genre, directorId, watched, rate} = args;
                return Movies.findByIdAndUpdate(
                    args.id,
                    {
                        $set: {
                            name,
                            genre,
                            directorId,
                            watched,
                            rate,
                        }
                    },
                    {new: true},
                );
            }
        },

    }
});

const Query = new GraphQLObjectType({
    name: 'Query',
    fields: {
        movie: {
            type: MovieType,
            args: {id: {type: GraphQLID}},
            resolve(parent, args) {
                return Movies.findById(args.id);
            }
        },
        director: {
            type: DirectorType,
            args: {id: {type: GraphQLID}},
            resolve(parent, args) {
                return Movies.find({directorId: parent.id});
            }
        },
        movies: {
            type: new GraphQLList(MovieType),
            args: { name: {type: GraphQLString}},
            resolve(parent, { name }) {
                return Movies.find({ name: { $regex: name, $options: "i" } });
            }
        },
        directors: {
            type: new GraphQLList(DirectorType),
            args: { name: {type: GraphQLString}},
            resolve(parent, { name }) {
                return Directors.find({ name: { $regex: name, $options: "i" } });
            }
        }
    }
});

module.exports = new GraphQLSchema({
    query: Query,
    mutation: Mutation,
});