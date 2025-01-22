import { BundleType } from "@/types";

const bundles: BundleType[] = [
    {
      name: "Trial Tester",
      price: 1,
      tokens: 5500,
      questions: Math.floor(5500 / 300),
      description: "Try out the system",
    },
    {
      name: "Quick Quiz Pack",
      price: 5,
      tokens: 30000,
      questions: Math.floor(30000 / 300),
      description: "Quick practice session bundle",
    },
    {
      name: "Smart Student Starter",
      price: 20,
      tokens: 120000,
      questions: Math.floor(120000 / 300),
      description: "Best value for regular practice!",
      highlight: true,
    },
    {
      name: "Weekend Warrior Bundle",
      price: 50,
      tokens: 310000,
      questions: Math.floor(310000 / 300),
      description: "Perfect for weekend study sessions",
    },
    {
      name: "Weekly Wonder Pack",
      price: 100,
      tokens: 650000,
      questions: Math.floor(650000 / 300),
      description: "Ideal for weekly intensive practice",
    },
    {
      name: "Monthly Master Bundle",
      price: 200,
      tokens: 1400000,
      questions: Math.floor(1400000 / 300),
      description: "Comprehensive monthly study plan",
    },
    {
      name: "Ultimate Scholar Pack",
      price: 500,
      tokens: 3800000,
      questions: Math.floor(3800000 / 300),
      description: "Perfect for entire semester preparation",
    },
  ];

  export default bundles