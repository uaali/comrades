import { BundleType } from "@/types";

const bundles: BundleType[] = [
  {
    name: "Trial Tester",
    price: 10,
    tokens: 4500,
    questions: Math.floor(4500 / 300),
    description: "Try out the system",
  },
  {
    name: "Quick Quiz Pack",
    price: 25,
    tokens: 11420,
    questions: Math.floor(11420 / 300),
    description: "Quick practice session bundle",
  },
  {
    name: "Smart Student Starter",
    price: 50,
    tokens: 22850,
    questions: Math.floor(22850 / 300),
    description: "Best value for regular practice!",
    highlight: true,
  },
  {
    name: "Weekend Warrior Bundle",
    price: 90,
    tokens: 44000,
    questions: Math.floor(44000 / 300),
    description: "Perfect for weekend study sessions",
  },
  {
    name: "Weekly Wonder Pack",
    price: 150,
    tokens: 69000,
    questions: Math.floor(69000 / 300),
    description: "Ideal for weekly intensive practice",
  },
  {
    name: "Monthly Master Bundle",
    price: 200,
    tokens: 92000,
    questions: Math.floor(92000 / 300),
    description: "Comprehensive monthly study plan",
  },
  {
    name: "Ultimate Scholar Pack",
    price: 500,
    tokens: 250000,
    questions: Math.floor(250000 / 300),
    description: "Perfect for entire semester preparation",
  },
];

export default bundles;
