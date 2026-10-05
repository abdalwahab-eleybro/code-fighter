# Code Fighter

An interactive coding game where you learn algorithms through battles. Fight enemies by answering coding questions correctly!

## Project Structure

```
code-fighter/
├── src/
│   ├── index.html              # Main HTML entry point
│   ├── css/
│   │   ├── themes.css          # CSS custom properties and themes
│   │   ├── animations.css      # All CSS animations
│   │   └── components.css      # Reusable UI components
│   ├── js/
│   │   ├── config/
│   │   │   ├── theme.js        # Theme configuration
│   │   │   └── game.js         # Game configuration
│   │   ├── core/
│   │   │   ├── utils.js        # Utility functions
│   │   │   └── state.js        # State management
│   │   ├── data/
│   │   │   └── fighters.js     # Fighter and enemy data
│   │   └── code-fighter.js     # Main game engine
│   └── templates/
│       ├── profile-bar.html    # Profile bar template
│       ├── menu-screen.html    # Menu screen template
│       ├── map-screen.html     # Campaign map template
│       ├── fight-screen.html   # Fight screen template
│       └── recap-screen.html    # Recap screen template
├── dist/                      # Production build output
├── package.json               # Project dependencies and scripts
├── build.js                   # Build script
└── README.md                  # This file
```

## How to Use

### Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run development server:**
   ```bash
   npm run dev
   ```
   This will start a local server at `http://localhost:3000`

3. **Build for production:**
   ```bash
   npm run build
   ```
   This creates optimized files in the `dist/` directory

### Customization

#### Adding New Content

**1. Add a new pattern:**
Edit `src/js/config/game.js` and add to the `PATTERNS` array:
```javascript
{ id: 'p-new', name: 'New Pattern', volume: 1 }
```

**2. Add a new fighter:**
Edit `src/js/data/fighters.js` and add to the `FIGHTERS` array:
```javascript
{ id: 'new-fighter', name: 'New Fighter', icon: '\ud83d\udd25', unlockLevel: 10 }
```

**3. Add a new question:**
Questions are generated in `src/js/code-fighter.js` in the `FightManager` class.
Add your questions to the `generateQuestion()` method or create a dedicated
question bank.

#### Changing Theme

Edit `src/css/themes.css` to modify colors:
```css
:root {
  --bg: #0a0e1a;
  --player: #22d3ee;
  --enemy: #f43f5e;
  /* ... */
}
```

Or add a new theme:
```css
[data-theme="my-theme"] {
  --bg: #ffffff;
  --player: #0000ff;
  /* ... */
}
```

#### Modifying Game Mechanics

Edit `src/js/config/game.js` to change:
- XP curve and rewards
- Difficulty settings
- Star calculation thresholds
- Session defaults

## Architecture

### Modular Design

The game is built with a modular architecture:

- **Config**: Centralized configuration files for easy modification
- **Data**: Separate data files for fighters, levels, questions
- **Core**: Reusable utilities and state management
- **UI**: Modular templates and screen management
- **Engine**: Main game logic orchestrating all modules

### Key Features

1. **Persistent State**: Uses localStorage to save progress
2. **Modular CSS**: Themes, animations, and components are separated
3. **Template-based UI**: HTML templates for each screen
4. **Easy Customization**: All content can be modified without touching core logic

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `npm run lint` to check for errors
5. Submit a pull request

## License

MIT License - feel free to use, modify, and distribute!
