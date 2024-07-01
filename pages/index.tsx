import Image from "next/image";
import { Inter } from "next/font/google";
import FlappyBird from "@/components/flappy_bird";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <FlappyBird />
  );
}
