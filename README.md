# Dhaka Bus Fare & Routes

Browse official bus routes across the Dhaka Metro Area, view stops, distances, and get instant fare estimates based on actual kilometer distances.

## Features

- **Comprehensive Routes**: Database of hundreds of official and unofficial bus routes operating in Dhaka.
- **Fare Calculator**: Calculate estimated fares between any two stops instantly.
- **Full Fare Chart**: View the complete fare matrix for all stops on a selected route.
- **Internationalization (i18n)**: Fully supported in both English and Bengali (`next-intl`).
- **Customizable Fares**: Adjust minimum fare and fare per kilometer rates according to current BRTA guidelines.
- **Fast Search**: Quickly search through routes by code, origin, or destination.
- **Responsive Design**: Modern, fast, and smooth interface for both desktop and mobile devices.

## Screenshots

![Homepage screenshot](public/images/homepage.png)

![Fare Calculator screenshot](public/images/farecalculator.png)

![Fare Chart screenshot](public/images/farechart.png)

![Route detail screenshot](public/images/routepage.png)

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/), [Radix UI](https://www.radix-ui.com/), [@base-ui/react](https://base-ui.com/)
- **Animations**: [Motion (Framer Motion)](https://motion.dev/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Internationalization**: [next-intl](https://next-intl-docs.vercel.app/)
- **Icons**: [Lucide React](https://lucide.dev/)

## Getting Started

### Prerequisites

Make sure you have Node.js installed (v18 or higher recommended).

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/hussain-ahmed2/dhaka-bus-fare.git
   cd dhaka-bus-fare
   ```

2. Install the dependencies:

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   # or
   bun install
   ```

3. Run the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. The application will automatically route you to your preferred locale (e.g., `/en` or `/bn`).

## Project Structure

- `app/`: Next.js App Router pages and layouts, including `[locale]/` for language-specific routing.
- `components/`: Modular and reusable React components.
- `messages/`: Translation JSON files (`en.json`, `bn.json`) for `next-intl`.
- `data/`: Core bus route, distance, and stop data definitions.
- `lib/`, `hooks/`, `types/`: Utilities, custom React hooks, and TypeScript type definitions.
- `i18n/`: Internal setup and configuration for internationalization routing.

## Contributing

This project is an open-source initiative to make public transit information accessible and structured for everyone in Dhaka.
Contributions are welcome! If you find incorrect route data, missing stops, or want to improve the application:

1. Fork the project.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

## Acknowledgements

The transit data utilized in this application is sourced from the [Dhaka Metro Area Bus Fare List](https://github.com/imamhossain94/dhaka-metro-area-bus-fare-list) repository, originally compiled and maintained by [imamhossain94](https://github.com/imamhossain94). We extend our gratitude for their extensive effort in digitizing and structuring the official route and distance information, which serves as the foundational dataset for this project.

## License

This project is open-source and available under the terms of the MIT License.

## Developed By

Designed and engineered by **[Hussain Ahmed](https://github.com/hussain-ahmed2)**.
