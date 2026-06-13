import { Project } from "ts-morph";

const project = new Project();
project.addSourceFilesAtPaths("src/**/*.tsx");
project.addSourceFilesAtPaths("src/**/*.ts");

const appFile = project.getSourceFileOrThrow("src/App.tsx");
const utilsFile = project.createSourceFile("src/utils.ts", "", { overwrite: true });

const randColor = appFile.getVariableStatement("getRandomColor");
if (randColor) {
  utilsFile.addVariableStatement({
    isExported: true,
    declarationKind: randColor.getDeclarationKind(),
    declarations: randColor.getDeclarations().map(d => ({
      name: d.getName(),
      initializer: d.getInitializer()?.getText()
    }))
  });
  randColor.remove();
}

const darken = appFile.getVariableStatement("darkenHsl");
if (darken) {
  utilsFile.addVariableStatement({
    isExported: true,
    declarationKind: darken.getDeclarationKind(),
    declarations: darken.getDeclarations().map(d => ({
      name: d.getName(),
      initializer: d.getInitializer()?.getText()
    }))
  });
  darken.remove();
}

appFile.addImportDeclaration({
  namedImports: ["getRandomColor", "darkenHsl"],
  moduleSpecifier: "./utils"
});

project.saveSync();
console.log("Extracted utils to src/utils.ts");
