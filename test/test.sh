#!/bin/sh
while true; do
    curl -s http://localhost:3000/metadata/http%3A%2F%2Fuwstream1.somafm.com
    sleep 5
done
