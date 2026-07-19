import { readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { Box3, Vector3 } from "three";

class NodeFileReader {
  result = null;
  onload = null;
  onloadend = null;
  onerror = null;

  readAsArrayBuffer(blob) {
    blob
      .arrayBuffer()
      .then((value) => {
        this.result = value;
        this.onload?.({ target: this });
        this.onloadend?.({ target: this });
      })
      .catch((error) => this.onerror?.(error));
  }

  readAsDataURL(blob) {
    blob
      .arrayBuffer()
      .then((value) => {
        this.result = `data:${blob.type};base64,${Buffer.from(value).toString("base64")}`;
        this.onload?.({ target: this });
        this.onloadend?.({ target: this });
      })
      .catch((error) => this.onerror?.(error));
  }
}

globalThis.FileReader = NodeFileReader;

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, "..");
const modelPath = path.join(
  projectRoot,
  "public",
  "models",
  "projector",
  "projector-prototype.glb"
);
const temporaryPath = `${modelPath}.tmp`;
const source = await readFile(modelPath);
const gltf = await new GLTFLoader().parseAsync(
  source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength),
  ""
);
const tabletop = gltf.scene.getObjectByName("Wood_tabletop");

if (!tabletop) throw new Error("Wood_tabletop was not found in the projector model.");

tabletop.scale.x = 0.76;
tabletop.updateMatrixWorld(true);
const tabletopSize = new Box3().setFromObject(tabletop).getSize(new Vector3());

const binary = await new GLTFExporter().parseAsync(gltf.scene, {
  binary: true,
  onlyVisible: false,
});

if (!(binary instanceof ArrayBuffer)) {
  throw new Error("The projector model did not export as binary GLB data.");
}

await writeFile(temporaryPath, Buffer.from(binary));
await rename(temporaryPath, modelPath);

console.log(
  `Shortened Wood_tabletop to ${tabletopSize.x.toFixed(2)} x ${tabletopSize.z.toFixed(2)} world units.`
);
