#!/bin/bash

baseUrl='https://api2.hiveos.farm/api/v2'
login='sidr555'
password='sOsid6Ih!'

# 1. Login
#-H "X-Security-Code: XXXXXX" \

response=`curl -s -w "\n%{http_code}" \
	 -H "Content-Type: application/json" \
	 -X POST \
	 -d "{\"login\":\"$login\",\"password\":\"$password\"}" \
	 "$baseUrl/auth/login"`
[ $? -ne 0 ] && (>&2 echo 'Curl error') && exit 1
statusCode=`echo "$response" | tail -1`
response=`echo "$response" | sed '$d'`
[[ $statusCode -lt 200 || $statusCode -ge 300 ]] && { echo "$response" | jq 1>&2; } && exit 1

# Extract access token
accessToken=`echo "$response" | jq --raw-output '.access_token'`

# 2. Get farms
response=`curl -s -w "\n%{http_code}" \
	 -H "Content-Type: application/json" \
	 -H "Authorization: Bearer $accessToken" \
	 "$baseUrl/farms"`
[ $? -ne 0 ] && (>&2 echo 'Curl error') && exit 1
statusCode=`echo "$response" | tail -1`
response=`echo "$response" | sed '$d'`
[[ $statusCode -lt 200 || $statusCode -ge 300 ]] && { echo "$response" | jq 1>&2; } && exit 1

# Display farms
echo "$response" | jq