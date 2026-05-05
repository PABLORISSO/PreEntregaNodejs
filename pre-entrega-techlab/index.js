const BASE_URL = "https://fakestoreapi.com";

const [, , method, resource, ...restArgs] = process.argv;

function showHelp() {
  console.log(`
Uso del programa:

1) Obtener todos los productos
   npm run start GET products

2) Obtener un producto por id
   npm run start GET products/15

3) Crear un producto
   npm run start POST products T-Shirt-Rex 300 remeras

4) Eliminar un producto
   npm run start DELETE products/7
  `);
}

function request(url, options = {}) {
  return fetch(url, {
    ...options
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Error HTTP ${response.status} - ${response.statusText}`);
      }

      return response.json();
    })
    .catch((error) => {
      console.error("Ocurrió un error en la petición:", error.message);
    })
    .finally(() => {
      console.log("Proceso terminado");
    });
}

function parseResource(resourcePath = "") {
  const parts = resourcePath.split("/").filter(Boolean);
  const [entity, id] = parts;

  return { entity, id };
}

function getProducts(resourcePath) {
  const { entity, id } = parseResource(resourcePath);

  if (entity !== "products") {
    console.error("Recurso no válido. Debe ser 'products' o 'products/<id>'.");
    return;
  }

  const endpoint = id
    ? `${BASE_URL}/products/${id}`
    : `${BASE_URL}/products`;

  request(endpoint, {
    method: "GET"
  })
    .then((data) => {
      if (data) {
        console.log("Resultado:");
        console.log(JSON.stringify(data, null, 2));
      }
    });
}

function createProduct(resourcePath, args) {
  const { entity } = parseResource(resourcePath);

  if (entity !== "products") {
    console.error("Recurso no válido. Para POST debe ser 'products'.");
    return;
  }

  const [title, price, category] = args;

  if (!title || !price || !category) {
    console.error("Faltan datos. Uso: npm run start POST products <title> <price> <category>");
    return;
  }

  const numericPrice = Number(price);

  if (Number.isNaN(numericPrice)) {
    console.error("El precio debe ser un número válido.");
    return;
  }

  const newProduct = {
    title,
    price: numericPrice,
    category
  };

  request(`${BASE_URL}/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      ...newProduct
    })
  })
    .then((data) => {
      if (data) {
        console.log("Producto creado:");
        console.log(JSON.stringify(data, null, 2));
      }
    });
}

function deleteProduct(resourcePath) {
  const { entity, id } = parseResource(resourcePath);

  if (entity !== "products" || !id) {
    console.error("Debes indicar un id. Uso: npm run start DELETE products/<id>");
    return;
  }

  request(`${BASE_URL}/products/${id}`, {
    method: "DELETE"
  })
    .then((data) => {
      if (data) {
        console.log("Producto eliminado:");
        console.log(JSON.stringify(data, null, 2));
      }
    });
}

function main() {
  if (!method || !resource) {
    showHelp();
    return;
  }

  const normalizedMethod = method.toUpperCase();

  switch (normalizedMethod) {
    case "GET":
      getProducts(resource);
      break;

    case "POST":
      createProduct(resource, restArgs);
      break;

    case "DELETE":
      deleteProduct(resource);
      break;

    default:
      console.error("Método no soportado. Usa GET, POST o DELETE.");
      showHelp();
  }
}

main();