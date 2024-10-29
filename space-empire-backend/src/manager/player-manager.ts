import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Player } from "../data/player-behavior";
import { GetPlayerDataAction, PlayerData } from 'shared';
import { JWT_SECRET } from '../server';
import { PlanetManager } from './planet-manager';
import { Socket } from 'socket.io';

export namespace PlayerManager {
	const players = new Map<string, Player>();

	export function setupHTTP(app) {
		app.post('/register', async (req: Request, res: Response) => register(req, res));
		app.post('/login', (req: Request, res: Response) => login(req, res));
	}
	
	export async function register(req: Request, res: Response) : Promise<Response> {
		const { username, password } = req.body;
	
		if (players.has(username)) {
			return res.status(400).json({ message: 'Username already exists.' });
		}
	
		const hashedPassword = bcrypt.hashSync(password, 10);
		const playerData : PlayerData = new PlayerData(username, hashedPassword);
		players.set(username, new Player(playerData));
		return res.status(201).json({ message: 'User registered successfully.' });
	}
	
	export function login(req: Request, res: Response) : Response {
		const { username, password } = req.body;
	
		const player = players.get(username);
		if (player && bcrypt.compareSync(password, player.data.password)) {
			const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });
	
			if (player.data.ownedPlanets.length === 0) {
				let randomPlanet = PlanetManager.getRandomPlanet();
				if (randomPlanet === null) throw Error();
				else {
					while(!randomPlanet || randomPlanet.data.owner != null) 
						randomPlanet = PlanetManager.getRandomPlanet();
					randomPlanet.data.owner = username;
					player.data.ownedPlanets.push(randomPlanet.data.uuid);
					console.log(`Assigned planet ${randomPlanet.data.uuid} to player ${username}`);
				}
			}
	
			return res.json({ token });
		} else {
			return res.status(401).json({ message: 'Invalid credentials' });
		}
	}

	export function setupWebSocket(socket : Socket) {
		GetPlayerDataAction.response(socket, (params) => {
			const playerData : PlayerData = PlayerManager.getPlayer(params.playerUuid).data;
			return {player: playerData};
		});
	}
	
	export function getPlayer(playerUuid : string) : Player {
		return players.get(playerUuid) as Player;
	}
}

  