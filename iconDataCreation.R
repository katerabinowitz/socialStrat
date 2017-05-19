setwd("/Users/katerabinowitz/Documents/Freelance/socialStrat")
library(dplyr)
library(reshape2)

# create dataset structure
app<-expand.grid(race = c("white","black","latino","other"), gender=c("man","woman"), familyType=c("single","singleWDependent", "Couple"),
                 education = c("noHS","HS","someCollege","BA","grad"),
            income=c("inc025","inc2550","inc5075","inc75100","inc100125","inc125150","inc150175","inc175200","inc200300","inc300400","inc400+"))

app <- app %>% mutate(icon=rep(0,1320)) %>%
              arrange(income, gender, familyType, education)

# manual fillout of dataset
write.csv(app,"iconsToFill.csv", row.names=FALSE)

# read back in filled out icon count
icons<-read.csv("icons_fill_right.csv", stringsAsFactors = FALSE)[c(2:7)]

#completed data file
write.csv(icons,"icons_filled.csv", row.names=FALSE)




