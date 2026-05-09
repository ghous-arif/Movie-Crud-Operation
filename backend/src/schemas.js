const { z } = require('zod')

const movieFields = {
  title: z.string().min(1).max(500),
  director: z.string().max(300).nullable().optional(),
  year: z.number().int().min(1888).max(2100),
  genre: z.string().max(120).nullable().optional(),
  rating: z.number().min(0).max(10).nullable().optional(),
}

const movieCreateSchema = z.object(movieFields)

const movieUpdateSchema = z.object(movieFields)

const moviePatchSchema = z
  .object({
    title: z.string().min(1).max(500).optional(),
    director: z.string().max(300).nullable().optional(),
    year: z.number().int().min(1888).max(2100).optional(),
    genre: z.string().max(120).nullable().optional(),
  })
  .strict()

const listQuerySchema = z.object({
  q: z.string().optional(),
  genre: z.string().optional(),
  sort: z.enum(['year', 'rating']).default('year'),
  order: z.enum(['asc', 'desc']).default('desc'),
})

const authSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(4)
})

function formatZodError(err) {
  return {
    detail: err.errors.map((e) => ({
      loc: e.path,
      msg: e.message,
      type: 'validation_error',
    })),
  }
}

module.exports = {
  movieCreateSchema,
  movieUpdateSchema,
  moviePatchSchema,
  listQuerySchema,
  authSchema,
  formatZodError,
}
