## Smart App

Smart App está basado en el framework de DJango

Para usar todos los servicios, es necesario crear un archivo .env con la siguiente configuración
```

SECRET_KEY=django-insecure-_tuclavesecreta
DEBUG=True
GOOGLE_MAPS_KEY=YOUR_API_KEY

```

## Ejecución con docker compose
0. Instalar Docker y Docker compose
1. Configurar el entorno
   - Configurar el entorno de compilación
      - crear un archivo .env en la carpeta raíz del repositorio, la misma carpeta donde se encuentra docker-compose.yml
      - agregar las variables requeridas al archivo .env como se muestra en el siguiente ejemplo:
      ```
      SECRET_KEY="django-insecure-_tuclavesecreta"
      DEBUG=True
      GOOGLE_MAPS_KEY="YOUR_API_KEY"
      ```
2. Compilar Docker Compose
   ```
   docker-compose -p smart_app build
   ```

3. Iniciar Docker Compose
   ```
   docker-compose -p smart_app up
   ```

5. Ir a la página de inicio en http://localhost:8001
