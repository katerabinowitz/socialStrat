setwd("/Users/katerabinowitz/Documents/Freelance/socialStrat")
library(dplyr)

app<-expand.grid(race = c("white","black","latino","other"), famType=c("man","woman","manDep","womanDep", "couple"),
            edu1 = c("noHS","HS","someCollege","BA","grad"), edu2 = c("noHS","HS","someCollege","BA","grad"), 
            income=c("0-20","20-40","40-60","60-80","80-100","100-125","125-150","150-200","200-300","300-400","400+"))

app <- app %>% mutate(icon=rep(0,5500),
                      edu2=ifelse(famType != "couple", NA, as.character(edu2))) %>%
              arrange(income, famType, race, edu1, edu2)

app <- unique(app) 

app <- app %>% arrange(income, famType, race, edu1, edu2)

table(app$famType)

#write.csv(app,"icons.csv", row.names=FALSE)

icons<-read.csv("icons_filled.csv", stringsAsFactors = FALSE)

str(icons)
table(icons$income)
icons <- icons %>% mutate(income = ifelse(income == "0-20", "inc020",
                                          ifelse(income == "20-40", "inc2040",
                                                 ifelse(income == "40-60", "inc4060",
                                                        ifelse(income == "60-80", "inc6080",
                                                               ifelse(income == "80-100", "inc80100",
                                                                      ifelse(income == "100-125", "inc100125",
                                                                             ifelse(income == "125-150", "inc125-150",
                                                                                    ifelse(income == "150-200", "inc150200",
                                                                                           ifelse(income == "200-300", "inc200300",
                                                                                                  ifelse(income == "300-400", "inc300400",
                                                                                                         ifelse(income == "400+", "inc400", income))))))))))))

write.csv(icons,"icons_filled.csv", row.names=FALSE)

incCount <- icons %>% group_by(income, race, edu1) %>%
                      summarize(count=sum(icon)) %>%
                      arrange(income, race)

incCountT <- icons %>% group_by(income) %>%
  summarize(count=sum(icon)) %>%
  arrange(count)
