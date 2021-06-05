const request = require('request');

const url = "http://localhost:10001"

let defaultInputs = 
[
	"' OR 1=1;",
	'" OR 1=1;',
	';--',
	'',
	undefined,
	null,
	["test1", "test2"],
	[null, undefined],
	1,
	-1,
	0.1123,
	{test: "teststring"}
];

(async () => {
	let user =
	{
		username: 'Test123',
		password: 'Test123',
		token: undefined
	};

	if(await login(user)) return;
	if(await pack(user)) return;

	console.log('tests passed!!');
})();

async function login(user)
{
	let tests =
	{
		url: '/login',
		method: 'POST',
		tests:
		[
			{data: null, expect: 100},
			{data: {}, expect: 1},
			{
				data:{username: user.username, password: user.password},
				expect: 0,
				execute: (body) => {user.token = body.token}
			}
		]
	};

	for(input of defaultInputs)
	{
		tests.tests.push({data: {username: input, password: input}, expect: 1});
	}

	if(await test(tests)) return 1;

	return 0;
}

async function pack(user)
{
	let tests =
	{
		url: '/pack',
		method: 'POST',
		tests:
		[
			{data: null, expect: 100},
			{data: {}, expect: 12},
			{data: {token: user.token}, expect: 0},
		]
	};

	for(input of defaultInputs)
	{
		tests.tests.push({data: {token: input}, expect: 12});
	}

	if(await test(tests)) return 1;

	return 0;
}

async function test(tests)
{
	process.stdout.write(`${tests.url}: `);
	for(let test of tests.tests)
	{
		if(await req(tests.url, test.data, test.expect, tests.method, test.execute)) return 1;
	}

	console.log("\x1b[32m%s\x1b[0m", "y");
}

async function req(path, data, expected, method, execute)
{
	return new Promise((resolve) => {
		request(`${url}${path}`,
		{
			json: true,
			method: method,
			body: data
		},
		(err, res, body) => {
			if(err)
			{
				console.log("\x1b[31m%s\x1b[0m", "f");
				console.log(data);
				console.log(body);
				return resolve(1);
			}

			if(res.statusCode === 200 && body && body.status === expected)
			{
				if(execute) execute(body);
				return resolve(0);
			}

			console.log("\x1b[31m%s\x1b[0m", "f");
			console.log(data);
			console.log(body);
			return resolve(2);
		});
	});
}
