# Setup with DigitalOcean

## 1. Login

Log into your [DigitalOcean cloud console](https://cloud.digitalocean.com/).

## 2. Create a droplet

In the top right menu, click the "Create" button and choose "Droplets" to create a new droplet.

## 3. Configure your droplet

Complete the droplet creation screen to define the configuration of your virtual machine.

Under the "Distributions" section make sure to select "Ubuntu" or "Debian". At the moment, `rocketry` only supports those two distributions. The version does not matter.

Under the "Authentication" section, make sure to setup the droplet with an "SSH Key". If you do not already have one uploaded to DigitalOcean, press the "New SSH Key" button to create a new one.

## 4. Wait for your droplet to initialize

It may take a few minutes for your droplet to initiate. Wait a few minutes until your droplet is powered up and online.

## 5. Try to SSH into your droplet

Open a new terminal window, and try to SSH into your droplet by using the "ipv4" IP provided:

```sh
# Change 1.2.3.4 to the ipv4 of your droplet
ssh root@1.2.3.4
```

## 6. Set a new root password

When you first ssh into your virtual machine, it will ask you you to configure a new root password. Complete this configuration.

## 7. You're done!

That's it. You can now use `rocketry` to deploy your application. Simply configure `.rocketryrc` with the IP of your new droplet and start deploying!
