import {z} from 'zod'

import {router, publicProcedure, privateProcedure} from '../trpc.js'

// TODO: Remove this

export const debug = router({
	// TODO: replace this with a ping express endpoint so frontend can sanity check against it
	sayHi: publicProcedure.query(() => 'hi'),
	dump: publicProcedure.query((options) => console.log(options)),
	greet: publicProcedure.input(z.string()).query(({input}) => `Hello ${input}!`),
	greetObj: publicProcedure.input(z.object({name: z.string()})).query(({input: {name}}) => `Hello ${name}!`),
	private: privateProcedure.query(() => 'hi'),
})