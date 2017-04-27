setwd("/Users/katerabinowitz/Documents/Freelance/socialStrat")
library(dplyr)
library(reshape2)

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

icons<-read.csv("icons_fill_right.csv", stringsAsFactors = FALSE)[c(2:7)]

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
                                                             ifelse(income == "400+", "inc400", income))))))))))),
                          famType = factor(famType,levels=c("couple", "man", "woman", "manDep", "womanDep"),ordered=TRUE),
                          income = factor(income,levels=c("inc020", "inc2040", "inc4060", "inc6080", "inc80100", "inc100125", 
                                                                "inc125150", "inc150200", "inc200300", "inc300400", "inc400")))


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

incCount <- icons %>% group_by(income, familyType) %>%
                      summarize(count=sum(icon)) %>%
                      arrange(income, familyType)

incCountT <- icons %>% group_by(income) %>%
  summarize(count=sum(icon)) %>%
  arrange(count)

write.csv(icons,"icons_filled.csv", row.names=FALSE)
