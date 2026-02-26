#!/usr/bin/env node

const { program } = require("commander");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");

// ── Replace with your actual GitHub username ──────────────────────────────────
const GITHUB_USER = "yourusername";
const REPO_NAME = "kesp-ui";
const BRANCH = "main";

const REGISTRY_URL = `https://raw.githubusercontent.com/${GITHUB_USER}/${REPO_NAME}/${BRANCH}/registry.json`;
const BASE_URL = `https://raw.githubusercontent.com/${GITHUB_USER}/${REPO_NAME}/${BRANCH}/registry`;

program
  .name("kesp-ui")
  .description("Add kesp-ui components to your project")
  .version("1.0.0");

// ── LIST command ──────────────────────────────────────────────────────────────
program
  .command("list")
  .description("List all available components")
  .action(async () => {
    try {
      console.log(chalk.cyan("\nFetching available components...\n"));
      const { data: registry } = await axios.get(REGISTRY_URL);

      registry.items.forEach((item) => {
        console.log(`  ${chalk.green("◆")} ${chalk.bold(item.name)}`);
        console.log(`    ${chalk.gray(item.description)}`);
        if (item.dependencies.length > 0) {
          console.log(`    ${chalk.yellow("deps:")} ${item.dependencies.join(", ")}`);
        }
        console.log();
      });
    } catch (err) {
      console.error(chalk.red("Error fetching registry:"), err.message);
    }
  });

// ── ADD command ───────────────────────────────────────────────────────────────
program
  .command("add <component>")
  .description("Add a component to your project")
  .option("-p, --path <path>", "Destination path", "components/ui")
  .action(async (component, options) => {
    try {
      console.log(chalk.cyan(`\nFetching registry...\n`));
      const { data: registry } = await axios.get(REGISTRY_URL);
      const found = registry.items.find((c) => c.name === component);

      if (!found) {
        console.log(chalk.red(`✖ Component "${component}" not found.\n`));
        console.log(chalk.gray(`Run ${chalk.white("npx kesp-ui list")} to see available components.`));
        process.exit(1);
      }

      // Download each file
      for (const file of found.files) {
        const fileName = path.basename(file.path);
        const fileUrl = `${BASE_URL}/${fileName}`;
        console.log(chalk.gray(`  Downloading ${fileName}...`));

        const { data: content } = await axios.get(fileUrl);

        const destPath = path.join(process.cwd(), options.path, fileName);
        await fs.ensureDir(path.dirname(destPath));
        await fs.writeFile(destPath, content, "utf8");

        console.log(chalk.green(`  ✔ ${fileName}`) + chalk.gray(` → ${options.path}/${fileName}`));
      }

      // Show dependency install hint
      if (found.dependencies && found.dependencies.length > 0) {
        console.log(
          chalk.yellow(`\n  Install dependencies:\n`) +
          chalk.white(`  npm install ${found.dependencies.join(" ")}\n`)
        );
      } else {
        console.log();
      }

      console.log(chalk.green(`✔ Done! `) + chalk.gray(`Import with:`));
      console.log(
        chalk.white(`  import ${toPascalCase(component)} from "@/components/ui/${component}";\n`)
      );
    } catch (err) {
      console.error(chalk.red("Error:"), err.message);
    }
  });

// ── Helper ────────────────────────────────────────────────────────────────────
function toPascalCase(str) {
  return str
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");
}

program.parse();
