#!/bin/sh
echo "Waiting for sql to start"
sleep 30s

echo "running set up script"
#run the setup script to create the DB and the schema in the DB
/opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "C#CG#yKo8j@D3t&" -d master -Q "CREATE DATABASE IF NOT EXISTS nextauth"