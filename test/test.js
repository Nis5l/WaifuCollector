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
		username: 'UnitTest',
		password: '_UnitTest_',
		token: undefined,
		userID: undefined,
		rank: undefined,
		uuids: []
	};

	if(await login(user)) return;
	if(await pack(user)) return;
	if(await adminGiveCards(user)) return;
	if(await upgrade(user)) return;
	if(await setMail(user)) return;

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
				execute: (body) => {user.token = body.token; user.userID = body.userID; user.rank = body.rank;}
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
			{data: {token: user.token}, expect: 0}
		]
	};

	for(input of defaultInputs)
	{
		tests.tests.push({data: {token: input}, expect: 12});
	}

	if(await test(tests)) return 1;

	return 0;
}

async function upgrade(user)
{
	let tests =
	{
		url: '/upgrade',
		method: 'POST',
		tests:
		[
			{data: null, expect: 100},
			{data: {}, expect: 1},
			{data: {token: user.token}, expect: 1},
			{data: {token: user.token, mainuuid: user.uuids[0], carduuid: user.uuids[2]}, expect: 1},
			{data: {token: user.token, mainuuid: user.uuids[2], carduuid: user.uuids[0]}, expect: 1},
		]
	};

	for(input of defaultInputs)
	{
		tests.tests.push({data: {token: user.token, mainuuid: user.uuids[0], carduuid: input}, expect: 1});
		tests.tests.push({data: {token: user.token, mainuuid: input, carduuid: user.uuids[0]}, expect: 1});
		tests.tests.push({data: {token: user.token, mainuuid: input, carduuid: input}, expect: 1});
	}

	tests.tests.push(
			{data:
				{
					token: user.token,
					mainuuid: user.uuids[0],
					carduuid: user.uuids[1]
				}, expect: 0
			});

	if(await test(tests)) return 1;

	return 0;
}

async function setMail(user)
{
	let tests =
	{
		url: '/setmail',
		method: 'POST',
		tests:
		[
			{data: null, expect: 100},
			{data: {}, expect: 1},
			{data: {token: user.token}, expect: 1},
		]
	};

	for(input of defaultInputs)
	{
		tests.tests.push({data: {token: user.token, mail: input}, expect: 1});
	}

	let r = Math.floor(Math.random() * 1000);
	tests.tests.push({data: {token: user.token, mail: `UnitMail${r}@unitmail.com`}, expect: 3});

	if(await test(tests)) return 1;

	return 0;
}

async function adminGiveCards(user)
{
	console.log("#giving cards");
	for(let i = 0; i < 3; i++)
	{
		let cardID = 1;
		if(i === 2) cardID = 2;
		if(await req("/card/give",
			{
				token: user.token,
				userID: user.userID,
				cardID: cardID,
				quality: 1,
				level: 1,
				frame: 0
			}, 0, 'POST', (body) => {user.uuids.push(body.uuid)})) return 1;
	}
	return 0;
}

async function test(tests)
{
	process.stdout.write(`${tests.method} ${tests.url}(${tests.tests.length}): `);
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
				console.log(err);
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
			console.log(`expected: ${expected}`);
			return resolve(2);
		});
	});
}
