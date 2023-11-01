const movieModel = require('../models/movie');

const BadRequestError = require('../errors/BadRequestError');
const NotFoundError = require('../errors/NotFoundError');
const ForbiddenError = require('../errors/ForbiddenError');

// Добавить новый фильм

module.exports.addMovie = (req, res, next) => {
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    thumbnail,
    movieId,
    nameRU,
    nameEN,
  } = req.body;
  const owner = req.user._id;
  movieModel.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    thumbnail,
    movieId,
    nameRU,
    nameEN,
    owner,
  })
    .then((movie) => res.send(movie))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Некорректные данные при добавлении фильма'));
      } else {
        next(err);
      }
    });
};

// Вернуть все фильмы
module.exports.getMovies = (req, res, next) => {
  const owner = req.user._id;
  movieModel.find({ owner })
    .then((movies) => res.send(movies))
    .catch(next);
};

// Удалить фильм
module.exports.deleteMovie = (req, res, next) => {
  const { movieId } = req.params;
  const userId = req.user._id;
  movieModel.findById({ _id: movieId })
    .then((movie) => {
      if (!movie) {
        throw new NotFoundError('Фильм по указанному id не найден');
      }
      if (!movie.owner.equals(userId)) {
        throw new ForbiddenError('Вы не можете удалить фильм');
      }
      return movieModel.findByIdAndRemove({ _id: movieId });
    })
    .then((movie) => res.send({ movie }))
    .catch((err) => {
      if (err.kind === 'ObjectId') {
        return next(new BadRequestError('Некорректные данные при поиске фильма'));
      }
      return next(err);
    });
};
