setwd("/Users/katerabinowitz/Documents/Freelance/socialStrat")
library(dplyr)
library(reshape2)

# Initial data creation
app<-expand.grid(race = c("white","black","latino","other"), famType=c("man","woman","manDep","womanDep", "couple"),
            edu1 = c("noHS","HS","someCollege","BA","grad"), edu2 = c("noHS","HS","someCollege","BA","grad"), 
            income=c("0-20","20-40","40-60","60-80","80-100","100-125","125-150","150-200","200-300","300-400","400+"))

app <- app %>% mutate(icon=rep(0,5500),
                      edu2=ifelse(famType != "couple", NA, as.character(edu2))) %>%
              arrange(income, famType, race, edu1, edu2)

app <- unique(app) 
app <- app %>% arrange(income, famType, race, edu1, edu2)

#write.csv(app,"icons.csv", row.names=FALSE)

# read back in filled out icon count
icons<-read.csv("icons_fill_right.csv", stringsAsFactors = FALSE)[c(2:7)]

#rename, refactor, break out family type
icons <- icons %>% mutate(income = ifelse(income == "0-20", "inc020",
                                      ifelse(income == "20-40", "inc2040",
                                          ifelse(income == "40-60", "inc4060",
                                            ifelse(income == "60-80", "inc6080",
                                                ifelse(income == "80-100", "inc80100",
                                                  ifelse(income == "100-125", "inc100125",
                                                      ifelse(income == "125-150", "inc125150",
                                                        ifelse(income == "150-200", "inc150200",
                                                          ifelse(income == "200-300", "inc200300",
                                                            ifelse(income == "300-400", "inc300400",
                                                             ifelse(income == "400+", "inc400", income))))))))))))


single <- icons %>% filter(famType != "couple") %>%
                    mutate(gender = ifelse(famType=="man" | famType=="manDep","man", "woman"),
                           familyType = ifelse(famType=="man" | famType=="woman", "single", "single with dependent"),
                           education=edu1) %>%
                    select(-edu1, -edu2, -famType)

couple <- icons %>% filter(famType=="couple") %>%
          select(-famType) %>%
          melt(id.vars=c("race","income","icon")) %>%
          mutate(familyType = "couple",
                 education = value,
                 gender = ifelse(variable=="edu1", "man", "woman")) %>%
          select(-variable,-value) %>%
          group_by(income,race,education,gender,familyType) %>%
          summarize(icon=sum(icon))

couple <- as.data.frame(couple)

icons <- rbind(single,couple)

#completed data file
write.csv(icons,"icons_filled.csv", row.names=FALSE)




# updated data - break up upper income levels to smaller intervals
app150<-expand.grid(race = c("white","black","latino","other"), gender=c("man","woman"), familyType=c("single","singlewithDependent", "Couple"),
                 education = c("noHS","HS","someCollege","BA","grad"),
                 income=c("inc150175","inc175200","inc200225","inc225250","inc250275","inc275300", "inc300325",
                          "inc325350","inc350375","inc375400", "inc45", "inc56","inc67","inc78", "inc89","inc900"))

app150 <- app150 %>% mutate(icon=rep(0,2040))
write.csv(app150,"icons150.csv", row.names=FALSE)

#read back in filled out icon count
icons150<-read.csv("icons150_filled.csv", stringsAsFactors = FALSE)

#rebuild dataset with more detailed upper income groups
under150 <- icons %>% filter(!(income %in% c("inc150200","inc200300","inc300400","inc400")))
allIcons <- rbind(under150, icons150)
table(allIcons$income)
str(allIcons)

allIcons <- allIcons %>% mutate(income = factor(income,levels=c("inc020","inc2040","inc4060","inc6080","inc80100","inc100125","inc125150","inc150175","inc175200",
                                                   "inc200225","inc225250","inc250275","inc275300","inc300325","inc325250","inc350375","inc375400",
                                                   "inc45","inc56","inc67","inc78","inc89","inc900"),ordered=TRUE))

write.csv(allIcons,"icons_filled.csv", row.names=FALSE)

