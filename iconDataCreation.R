library(dplyr)
library(reshape2)

# create dataset structure for low end
# create dataset structure for low end
# create dataset structure for low end
app<-expand.grid(race = c("white","black","latino","other"), gender=c("man","woman"), familyType=c("single","singleWDependent", "Couple"),
                 education = c("noHS","HS","someCollege","BA","grad"),
            income=c("inc025","inc2550","inc5075","inc75100","inc100125","inc125150","inc150175","inc175200","inc200300","inc300400","inc400+"))

app <- app %>% mutate(icon=rep(0,1320)) %>%
              arrange(income, gender, familyType, education)

# manual fillout of dataset
write.csv(app,"iconsToFill.csv", row.names=FALSE)

# create dataset structure for high end
# create dataset structure for high end
# create dataset structure for high end
app2<-expand.grid(race = c("white","black","latino","other"), gender=c("man","woman"), familyType=c("single","singleWDependent", "Couple"),
                 education = c("noHS","HS","someCollege","BA","grad"),
                 income=c("inc200225","inc225250","inc250275","inc275300","inc300325","inc325350","inc350375", "inc375400","inc400+"))
app2 <- app2 %>% mutate(icon=rep(0,1080)) %>%
  arrange(income, gender, familyType, education)

# manual fillout of dataset
write.csv(app2,"iconsToFillHi.csv", row.names=FALSE)


# read back in filled out icon counts and combine
# read back in filled out icon counts and combine
# read back in filled out icon counts and combine
iconsLo<-read.csv("iconsFilledLo.csv", stringsAsFactors = FALSE)
iconsHi<-read.csv("iconsFilledHi.csv", stringsAsFactors = FALSE)

iconsLoSub <- iconsLo %>% subset(!(income %in% c("inc200300","inc300400","inc400+")))

icons <- rbind(iconsLoSub, iconsHi) %>%
         mutate(income = factor(income, levels = c("inc400+", "inc375400", "inc350375", "inc325250", "inc300325", "inc275300", "inc250275", "inc225250", 
                                                   "inc200225", "inc175200", "inc150175", "inc125150", "inc100125", "inc75100", "inc5075", "inc2550", "inc025")),
                #ugh
                education = ifelse(education == "noHS", "No High School",
                              ifelse(education == "HS", "High School",
                                ifelse(education == "someCollege", "Some College",
                                  ifelse(education == "BA", "Bachelor's Degree","Graduate Degree")))),
                familyType = ifelse(familyType == "single", "Single",
                                ifelse(familyType == "singleWDependent", "Single with Dependent(s)","Couple")),
                race = ifelse(race == "white", "White", 
                          ifelse(race == "black", "Black", 
                            ifelse(race == "latino", "Latino", "Other"))),
                gender = ifelse(gender == "woman", "Woman", "Man"),
                
                education = factor(education, levels = c("No High School", "High School", "Some College", "Bachelor's Degree","Graduate Degree")),
                familyType = factor(familyType, levels = c("Single", "Single with Dependent(s)", "Couple")),
                race = factor(race, levels = c("White","Latino", "Black", "Other")), 
                gender = factor(gender, levels = c("Woman","Man"))) %>%
                
                arrange(income, gender, familyType, education)

#completed data file
write.csv(icons,"iconsFilled.csv", row.names=FALSE)


