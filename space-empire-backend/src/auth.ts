import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { users } from './server';
import { planets } from './game';
import { PlanetData, PlayerData } from 'shared';

const JWT_SECRET = 'your_jwt_secret_key';

export async function register(req: Request, res: Response) : Promise<Response> {
  const { username, password } = req.body;

  if (users[username]) {
    return res.status(400).json({ message: 'Username already exists.' });
  }

  users[username] = new PlayerData(username, bcrypt.hashSync(password, 10));
  return res.status(201).json({ message: 'User registered successfully.' });
}

export function login(req: Request, res: Response) : Response {
  const username : string = req.body.username;
  const password : string = req.body.password;

  if (users[username] && bcrypt.compareSync(password, users[username].password)) {
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });
    const player : PlayerData = users[username];

    if (player.ownedPlanets.length === 0) {
      let randomPlanet = planets.getRandom();
      if (randomPlanet === null) throw Error();
      else {
        while(!randomPlanet || randomPlanet.data.owner != null) 
          randomPlanet = planets.getRandom();
        randomPlanet.data.owner = username;
        player.ownedPlanets.push(randomPlanet.data.uuid);
        console.log(`Assigned planet ${randomPlanet.data.uuid} to player ${username}`);
      }
    }

    return res.json({ token });
  } else {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
}
