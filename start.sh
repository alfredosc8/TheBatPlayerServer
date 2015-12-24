git checkout .
git pull
npm install
# My own module, so I know the changes.
npm update node-internet-radio

export NEW_RELIC_LOG=stdout

totalRam=`vmstat --unit m -s |grep "total memory" |awk '{print $1;}'`
assignedRam=`echo "$totalRam * 0.6" | bc -l`
roundedValue=${assignedRam%.*}

echo "Starting The Bat Server with RAM: " $roundedValue "M"
NODE_ENV=production /usr/local/bin/forever start -c "node --max-old-space-size=$roundedValue --nouse-idle-notification" /home/gabek/TheBatPlayerServer/bin/www
