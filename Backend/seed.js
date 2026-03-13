import dotenv from "dotenv";
import connectDB from "./config/db.js";
import Role from "./models/Roles.models.js";

dotenv.config();
await connectDB();

const seedRoles = async () => {
  try {
    const roles = [
      {
        name: "SUPER_ADMIN",
        description: "Super Administrator",
        isSystemRole: true,
      },
      { name: "ADMIN", description: "Administrator", isSystemRole: true },
      { name: "USER", description: "Regular User", isSystemRole: true },
    ];

    for (const role of roles) {
      const existing = await Role.findOne({ name: role.name });
      if (!existing) {
        await Role.create(role);
        console.log(`Created role: ${role.name}`);
      } else {
        console.log(`Role ${role.name} already exists`);
      }
    }

    console.log("Seeding completed");
    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
};

seedRoles();
