FROM apache/nifi:latest

# Install OpenJDK to get keytool
USER root
RUN apt-get update && apt-get install -y openjdk-11-jre-headless

# Switch back to the nifi user
USER nifi

# Environment variables for the keystore and truststore
ENV KEYSTORE_PASSWORD=keystorepassword
ENV TRUSTSTORE_PASSWORD=truststorepassword
ENV KEY_ALIAS=nifi-key

# Generate the keystore and self-signed certificate
RUN keytool -genkeypair -alias $KEY_ALIAS -keyalg RSA -keystore /opt/nifi/nifi-current/conf/keystore.jks \
    -storepass $KEYSTORE_PASSWORD -validity 365 -keysize 2048 -dname "CN=localhost, OU=IT, O=MyOrg, L=MyCity, ST=MyState, C=US"

# Export the certificate from the keystore
RUN keytool -export -alias $KEY_ALIAS -file /opt/nifi/nifi-current/conf/nifi-cert.crt \
    -keystore /opt/nifi/nifi-current/conf/keystore.jks -storepass $KEYSTORE_PASSWORD

# Create the truststore and import the certificate
RUN keytool -import -file /opt/nifi/nifi-current/conf/nifi-cert.crt -alias nifi-cert \
    -keystore /opt/nifi/nifi-current/conf/truststore.jks -storepass $TRUSTSTORE_PASSWORD -noprompt