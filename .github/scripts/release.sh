#!/usr/bin/env bash

#release.sh 1.8.2
#creates a libretime folder with a "1.8.2" suffix
#creates tarballs with a "1.8.2" suffix

#release.sh 1.8.2 RC
#creates a libretime folder with a "1.8.2-RC" suffix
#creates tarballs with a "1.8.2-RC" suffix

#release.sh 1.8.2-RC
#creates a libretime folder with a "1.8.2-RC" suffix
#creates tarballs with a "1.8.2-RC" suffix

if [ $# == 0 ]; then
    echo "Zero arguments"
    exit 1
elif [ $# == 1 ]; then
    suffix=$1
else
    suffix=$1-$2
fi

echo "Creating tarball for LibreTime ${suffix}."

echo -n "Creating VERSION file for ${suffix}..."
echo -n "${suffix}" > ./VERSION
echo " Done"

echo -n "Running composer install..."
pushd airtime_mvc || (echo "could not cd in airtime_mvc!" && exit 1)
composer install --quiet --no-dev --ignore-platform-reqs
popd || exit
echo " Done"

# Adding back; may be useful later...
#echo "Minimizing LibreTime Javascript files..."
#cd $dir
#find $target/airtime_mvc/public/js/airtime/ -iname "*.js" -exec bash -c 'echo {}; jsmin/jsmin < {} > {}.min' \;
#find $target/airtime_mvc/public/js/airtime/ -iname "*.js" -exec mv {}.min {} \;
#echo "Done"

cd ..
find "libretime-${suffix}" -type f -exec dos2unix {} \;
echo -n "Creating tarball..."
tar -czf "libretime-${suffix}.tar.gz" \
        --owner=root --group=root \
        --exclude-vcs \
        --exclude .zfproject.xml \
        --exclude .gitignore \
        --exclude .gitattributes \
        --exclude .travis.yml \
        --exclude travis \
        --exclude dev_tools \
        --exclude airtime_mvc/vendor/phing \
        --exclude airtime_mvc/vendor/simplepie/simplepie/tests \
    libretime
echo " Done"
