#!/bin/sh

echo "========== CONTAINER STARTUP DEBUG INFO =========="
echo "Starting application..."
echo "Environment: $ENV"
echo "Port: $PORT"
echo "DB URL configured: $(if [ -n "$DB_URL" ]; then echo "yes"; else echo "no"; fi)"
echo "JWT Secret configured: $(if [ -n "$JWT_SECRET" ]; then echo "yes"; else echo "no"; fi)"
echo "SMTP Username configured: $(if [ -n "$SMTP_USERNAME" ]; then echo "yes"; else echo "no"; fi)"
echo "SMTP Password configured: $(if [ -n "$SMTP_PASSWORD" ]; then echo "yes"; else echo "no"; fi)"
echo "Current directory: $(pwd)"
echo "Directory contents:"
ls -la

echo "Checking migrations directory:"
if [ -d "./db/migrations" ]; then
  echo "✅ Migrations directory exists:"
  ls -la ./db/migrations
else
  echo "⚠️ Migrations directory not found! Creating it..."
  mkdir -p ./db/migrations
fi

echo "Checking public directory:"
if [ -d "./public" ]; then
  echo "✅ Public directory exists"
else
  echo "⚠️ Public directory not found! Creating it..."
  mkdir -p ./public/images
fi

echo "Ensuring public/images directory exists:"
mkdir -p ./public/images
echo "public/images directory contents:"
ls -la ./public/images

# Check for default profile picture and create if missing
if [ ! -f "./public/images/default_pfp.jpg" ]; then
  echo "⚠️ Default profile picture missing, creating placeholder..."
  echo 'iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAYAAADimHc4AAAABmJLR0QA/wD/AP+gvaeTAAAKJUlEQVR4nO2de3BU1R3Hv7+z2QghZDeAECIRFbXiAwHlIVoEOiojFMdKaaGOM61auzrWv+qUGWfo6DjTh3U6tQ87tBUVThCs+ChQoW1sBAYf1D5ApGLlEcKjDAGz2SS72Xv2d/rHZkN2s3fv3XtP7g3cz0xmknv2nN/53d9nz8v97T2AQqFQKBQKhUKhUCgUCoVCoVAoFJB4N4AYzw4qivcl2Lo3UVeVkKVJxnI7AAiAgJibNwlGJ5hLAWQTxRMlhwAxnntv1tlPI9F5RK3JCxcuRGVlJfL5bEg+b5S67ugx9u2mJxEpxXsFSOJ5QUVFRSgrK4MQAkIIBfThoczxV2CJSW1z3qP5PKNUiNL8uVt6wsvW5mIQAkxN4POsnlstCAJDikTYxDpOju7e3JR5/L+IxCcCL66ZRwTkc5kfpbav+3Pkb22JFAO8jZvnSyFqGazahrykuG4zPvlQ8Ysmsu3QfC/EN4UQ92k+3aa8m2fs+M9uYfv0YJFSgLNPTppkC+1nAM1gro5wzW5BUAO01XvP9i+TP8ALXIgn9Yun/95hsL2wQAigZdMZK4WmrWPGAiZURjBfD39/k8GsAZr0iu5BPunK87vLq+Y3SsneWAImgLZ1/SSB3FoG3cfEw8L0jUPgzm80fJtQGfT2FaMQv9eI1grhfViXbrwXgosiQHDrRWO0pLaVmO9nxgQr8laEwGMAnsuve7c+5A0uQvD5Uffo2ZR2BZguN1dUJKxUuIzAVQCeRWsqbblDx1sA3/NTy0Rp6QeMdJWVYmc70z44mq/fMbLi1o7fjlgCBDfMnEJC20ws5ljJWFwojZlWEGibbft8ayDX5OkDR/6oFvTmmCpgzJgxSKfT0H1nMvD5YMNkuHwzwDfDXTKiIwbquH3LGgBr4OQvmLP/e1EE0LyWHxDhMQBl1jMVHZQyYe6B7ZFXoJZBozY9aLmuFfEfAiAMcA4WV3pxAEGajZJOAHd2FxQLx6YoJZpJagGu21fX1NXVYdy4Hl9PADM4lwOyOapHwb6eo2wvnT/upx0FQQJYwfwrC0/eaY+HwLEt0QTQst0+72l9wl108HPIB9rCCiAAnN696bGu8lACaENqR0LXfgbwDyzoQXFsBbK26+d0t9zrRogVWNOulcRioQXG8AcKp1vRLBvQXef3FGvECCHAd59bkCPb+SXAlZYTLE7YYXjuvlt3dBfGvALavD4P5hotJlo88LSTnewp8XgJIKgk/e/EtDrG5IoJKaHlcrlVPYVxEYABQVjKoMe4O3cGInMo41UUYEGgR4loyJVH818bPAQIZp9YIODnLCdWfMgNHKqbbyVRoACCIBQ9Hv4IMbsegxbu4T9rMmIJIMFcyhYTK05u2r///C4rCUMI0OasNZACbLnN26wkDB8GSSoHYPl3DsUGg8YF/b/GSAI4KUApuOFsJAxvg0jppJAQ+tJ3d581LFYaADhxeFjMvKGVALJANVYShhdAsspBiHuI16l3LEQRd8gbCVBKjlsvUBQfXu2lxag+kCzmAMY8ag4wBJ61YmB0G8R52w1YviKKD+lDnvAC8Bb+o/UCKQF6CStADVDtJaxoKYBW4Azwd+qEFguQBaKdFpMDDQ0NaGzE9NzcuVdxNGErF2DD0HSlJQ3hBWAaYzW1bJp+xOYNF1op8BKSvwSQC1FGeGUNS6ymll26puFKK+lD26C6bEvH/5hRdCLA0IWrRLgCHF13DzHqLRXQEi7gwwBtD721yAbaX4U9ww+hJQz9rUM+P3pbsBYruFoHkFE6rGiqaYQXgKTuZa04XsnoLAKTfj9yZ5/5AEBzrRRrK94kjgI9J+RFBIO7ylF6xQVoAdGdKcEA9Kdf+25waKsJGQEAjqj0FnJcbCmh6RO2mqspQgI43TcwAOIbkRXerzVy9S8JkPbBwQZeMg7+A5GfEIkJ+qxD+SSO93MlGgEw9qPQVlOEFIBrWw46jmiiOLbOT7/+hFTrGHFMtrSapvBTEYOO6TkPj7x2u6sj5k+JeUcAoD0AP38BnI0cG5Tf/GxV5DR82iBmrALos4gpFRuCcot3b/ael8MVI7y/pvZ+xswtgfa1otgKbPOG3NuRV7++lDwq+t7AmefWMLAihmuXLnaOGLYxYqVgfEkmIvvV3m3r/uu1UEEC2LduygN4NVCJ4oDzDKyIF/q7l6wgMV6c3diwHY69CvCJGJKPL54E8WJcv7fhw3gUH1gAmOUyxvCHD+5a/xocuRKgjwGa8PQvckQeOcPeZKQXr9/baMvJWEvTBZgZ6sFoX/CYiZnxi9x/0SqDXEu8BTA4AYCIcNXu7euep5Z9Y8FD7pvzptx09dz5g4QQ+mVCk5dKzXg1zGXLnAkaZZmy2bhzn3soeMYjiQArb3XsH2W1wc9oY4sbG+rh8hOAXB8i2oFCpVx8yG2OlrpnX0M28i5WgXi2QQBzj2gw47Hc/fOmLGRNfMdEi++j5txlnQUoNvSF5PJDRLQuLN+vsyKDwYwoAkTB5MLc5T/W77qLDOP3DN7QU/q40Ix9bMglRHRNRnf0sXUVSVuWr0lnHLshm8kbSR3YU/OOUh7qheROFwi24PYojhOmLCkPXmoxAgggQHYegPtsDqXtcySzu6/76wSpaCw2NSH+qdE7zDyrdnZ5AoDhiH3MfJBcbih4iNIagQSY+p89GUeva8jnc28DWB127TKN72+7tFCEnbmPtdIozpvMfB0MW3PDsa8EYOeZfv7sXn+P03+LYdoHtq8P9JrGwBvJTXz9TYCWmTdpB2Z6ZEiz7b5uTjgZfcOui4CSbi8U75c3OVZw9z9hbPrApMf8mAHAaOd30Hhxnrxy0BXldLQlagfMdUxvT50zo1a4+nEATnP0+i0KYuNk9Eg/Jy8fTPhzdvYoAE0GbnKZGfUMbsxzapJd8X7NF/1rxT7x5ASqvfc9APPByFm1eSZRk2A8e/ae5gmB8o2XGK+E3ZeFFbpUNzQzoV2X5huJ17CsvCmy8X5JJJYeOPduBHDHvx9fkmLN+SHAj8J4bYY1mntxLGssBGEhgPHh0rKGJGALgta4bu7JgDuExoaVhGzROGdGLQu6gYm/F0nAYoXBTU7G+Ujz8Ah/aSw9cO7dqGzRSl85xL5AAGDZvvO98nDLW+3vEGvT2TEdlJqtMV1AzN8DcE14+WMiQWgjwu+lI54PP34iWwhsrKqZ/K8DXh8gNlw+rD/1c6bfBnEDQOUSYZZNJqL1RHh2QGbg7uZm83GYUpxIdy6ecekEPZG6gllfD8YcCBplJgfsSDwAEDgC0C4Q7dZAb02b0rzlq69M9i2PRhKc731Rf5pzavVsR5d1kngaXJoKYBKIKkBUAUab1OjYPqJpOMlkHjWO5aRA+oE2LXOIkWgFOAeATUYLCCeZ5AkmHIDBu3PZ1D+DVnJWrtlXKBQKhUKhUCgUCoVCoVAoFAoFimXj5f8BhXjfT2tdwSwAAAAASUVORK5CYII=' | base64 -d > ./public/images/default_pfp.jpg
  echo "✅ Default profile picture created"
else
  echo "✅ Default profile picture exists"
fi

# 🟩 RUN GOOSE MIGRATIONS
if [ "$RUN_MIGRATIONS" = "true" ]; then
  echo "🔄 Running Goose migrations..."
  goose -dir ./db/migrations postgres "$DB_URL" up
  if [ $? -ne 0 ]; then
    echo "❌ Goose migration failed!"
    exit 1
  else
    echo "✅ Goose migrations completed"
  fi
else
  echo "⏩ Skipping Goose migrations"
fi

echo "============= STARTING APPLICATION =============="
exec ./main 2>&1
