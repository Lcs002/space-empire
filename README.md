# Space Empire
Space Empire is an online multiplayer 2D space strategy game where players expand their galactic influence by conquering planets, gathering resources, and constructing structures to grow their space empire. The project uses a Node.js backend, WebSockets for real-time communication, and PixiJS for graphics rendering.

## Project Overview
The goal of Space Empire is to create an engaging strategy game where players compete for resources and territory in a procedurally generated galaxy. Each planet has unique properties and resources, and players can build structures, gather materials, and strengthen their empire in real time.

This game is designed to be web-based for accessibility and simplicity. It uses low graphics intensity for smoother performance, even on lower-end devices.

## Features
- Procedurally Generated Galaxy: A unique galaxy with various zones and resources is generated, ensuring each game is different.
- Planet Ownership and Structures: Players can conquer planets, build structures, and increase resource production and population capacity.
- Resource Management: Gather bio, gas, and mineral resources from planets and use them to build and expand.
- Real-Time Multiplayer: Players interact with each other in real time, including attacking planets and managing their territories.
- Backend-Frontend Synchronization: Regular updates keep the player’s view up-to-date with changes in resource and structure status.

## Tech Stack
- Frontend: PixiJS (for rendering), TypeScript
- Backend: Node.js, Express, Socket.io, MySQL (for data storage)
- Communication: WebSockets for real-time data flow
- Build Tool: Vite (for frontend)
