import * as path from "path";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import * as RTE from "fp-ts/ReaderTaskEither";
import * as A from "fp-ts/ReadonlyArray";
import * as TE from "fp-ts/TaskEither";
import { FileSystem, fileSystem } from "./FileSystem";
import { run } from "./run";

interface Build<Val> extends RTE.ReaderTaskEither<FileSystem, Error, Val> {}

const OUTPUT_FOLDER = "lib"
const PKG = "package.json"

export const copyPackageJson: Build<void> = (C) =>
    pipe(
        C.readFile(PKG),
        TE.chain((s: string) => TE.fromEither(E.parseJSON(s, E.toError))),
        TE.map((v) => {
            const clone = Object.assign({}, v as any)

            delete clone.scripts
            delete clone.files
            delete clone.devDependencies

            clone.main = clone.main.toString().replace(`${OUTPUT_FOLDER}/`, "");
            clone.types = clone.types.toString().replace(`${OUTPUT_FOLDER}/`, "");

            return clone
        }),
        TE.chain((json) => C.writeFile(path.join(OUTPUT_FOLDER, PKG), JSON.stringify(json, null, 2)))
    )

export const FILES: ReadonlyArray<string> = ["CHANGELOG.md", "LICENSE", "README.md"]

export const copyFiles: Build<ReadonlyArray<void>> = (C) =>
    pipe(
        FILES,
        A.traverse(TE.taskEither)((from) => C.copyFile(from, path.resolve(OUTPUT_FOLDER, from)))
    )

const main: Build<readonly void[]> = pipe(
    copyPackageJson,
    RTE.chain(() => copyFiles),
)

run(
    main({
        ...fileSystem
    })
)
